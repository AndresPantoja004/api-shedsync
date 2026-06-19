# API ShedSync

Plataforma de gestión de horarios y reservas de espacios educativos, diseñada para instituciones académicas que necesitan organizar horarios de clases, profesores, estudiantes y espacios disponibles.

> **Nota de arquitectura:** ShedSync nació como un **monolito** (Express + Sequelize) y fue **migrado a una arquitectura de microservicios**. Hoy el sistema se compone de **6 servicios independientes**, cada uno con su propia base de datos, coordinados por un **API Gateway** y comunicados de forma síncrona (HTTP) y asíncrona (RabbitMQ).

## Descripción General

ShedSync provee el backend de la aplicación móvil del mismo nombre. Sus capacidades se reparten entre servicios autónomos:

- Autenticación y autorización de usuarios (JWT) → **identity**
- Gestión de carreras, semestres, asignaturas, profesores y estudiantes → **academico**
- Administración de espacios, laboratorios y equipamiento → **espacios**
- Gestión e importación de horarios desde archivos XLSX → **horarios**
- Reserva y aprobación de espacios → **reservas**
- Registro y seguimiento de incidencias → **incidencias**

## Arquitectura de Microservicios

```
                          ┌─────────────────────────┐
        Cliente móvil ───▶│   API Gateway  (:8080)  │  ← único punto de entrada público
                          │ CORS · Helmet · rate-limit
                          │ proxy + /health agregado │
                          └────────────┬─────────────┘
                                       │ HTTP (proxy por prefijo de ruta)
        ┌───────────┬──────────────┬───┴────────┬──────────────┬──────────────┐
        ▼           ▼              ▼            ▼              ▼              ▼
   ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐
   │identity │ │academico │ │ espacios │ │ horarios │ │ reservas │ │incidencias │
   │  :3001  │ │  :3002   │ │  :3003   │ │  :3004   │ │  :3005   │ │   :3006    │
   └────┬────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬──────┘
        │           │            │            │            │             │
   ┌────▼────┐ ┌────▼─────┐ ┌────▼─────┐ ┌────▼─────┐ ┌────▼─────┐ ┌─────▼──────┐
   │identity │ │academico │ │ espacios │ │ horarios │ │ reservas │ │incidencias │
   │  _db    │ │   _db    │ │   _db    │ │   _db    │ │   _db    │ │    _db     │
   │ :5441   │ │  :5442   │ │  :5443   │ │  :5444   │ │  :5445   │ │   :5446    │
   └─────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────────┘
                                                          │             │
                                                          └──────┬──────┘
                                                                 ▼
                                                   ┌──────────────────────────┐
                                                   │ RabbitMQ  (:5672 / :15672)│
                                                   │ exchange topic            │
                                                   │ "schedsync.events"        │
                                                   └──────────────────────────┘
```

### Principios de diseño

- **Database-per-service:** cada microservicio es dueño de su propia base de datos PostgreSQL. No hay JOINs distribuidos; los datos cruzados se resuelven por **composición HTTP** (clientes en `src/clients/`) o por **eventos**.
- **API Gateway como único punto de entrada:** el gateway (puerto `8080`) enruta por prefijo de ruta hacia el servicio destino, **sin reescribir el path** (cada servicio monta sus rutas en el mismo prefijo `/api/...`). Centraliza CORS, Helmet, rate-limiting y un `/health` agregado.
- **Servicios autónomos:** cada servicio arranca por sí solo, tiene su propio `Dockerfile`, su `/health`, y mantiene CORS/Helmet propios además de los del gateway.
- **Comunicación síncrona (HTTP):** para composición de datos en tiempo de request (p. ej. `espacios` consulta `horarios` y `reservas` para calcular disponibilidad). Con **degradación elegante**: si un servicio dependiente falla, se devuelven listas vacías en lugar de romper la respuesta.
- **Comunicación asíncrona (RabbitMQ):** `reservas` e `incidencias` publican eventos al exchange topic `schedsync.events` (p. ej. `reserva.creada`). Si RabbitMQ no está disponible, los servicios siguen funcionando con los eventos deshabilitados.
- **JWT compartido:** `identity` **firma** los tokens; el resto de servicios los **verifican** usando el mismo `JWT_SECRET`.

### Servicios

| Servicio | Puerto | Base de datos (puerto) | Responsabilidad | Depende de |
|---|---|---|---|---|
| **gateway** | 8080 | — | Punto de entrada, proxy, seguridad, health agregado | todos |
| **identity** | 3001 | identity_db (5441) | Login, registro, usuarios, roles, seed admin | academico (HTTP) |
| **academico** | 3002 | academico_db (5442) | Carreras, semestres, asignaturas, profesores, estudiantes | — |
| **espacios** | 3003 | espacios_db (5443) | Espacios, laboratorios, equipos, disponibilidad | horarios, reservas (HTTP) |
| **horarios** | 3004 | horarios_db (5444) | Horarios, conflictos, importación XLSX | academico, espacios (HTTP) |
| **reservas** | 3005 | reservas_db (5445) | Reservas y aprobaciones | espacios, horarios (HTTP) · RabbitMQ |
| **incidencias** | 3006 | incidencias_db (5446) | Reporte y seguimiento de incidencias | espacios (HTTP) · RabbitMQ |

## Stack Tecnológico

- **Runtime:** [Bun](https://bun.com) (ejecuta TypeScript directamente, sin paso de build)
- **Lenguaje:** TypeScript
- **Framework web:** Express.js
- **ORM:** Sequelize sobre **PostgreSQL 16**
- **Gateway/proxy:** `http-proxy-middleware`
- **Mensajería:** RabbitMQ (`amqplib`), exchange topic `schedsync.events`
- **Autenticación:** JWT (`jsonwebtoken`) + `bcryptjs`
- **Seguridad:** Helmet, CORS, `express-rate-limit`
- **Importación de datos:** XLSX
- **Orquestación:** Docker Compose + Makefile

## Requisitos Previos

- [Docker](https://www.docker.com/) y Docker Compose (forma recomendada de ejecución)
- (Opcional, para desarrollo local de un servicio) [Bun](https://bun.com) y una instancia de PostgreSQL

## Puesta en Marcha (Docker Compose)

La forma recomendada de levantar todo el sistema es con Docker Compose. Se incluye un `Makefile` con atajos.

1. Clonar el repositorio:

```bash
git clone <repository-url>
cd api-shedsync
```

2. Configurar variables de entorno:

```bash
cp .env.example .env
# Editar .env y definir un JWT_SECRET seguro
```

3. Construir y levantar todos los servicios (gateway, 6 servicios, 6 bases Postgres y RabbitMQ):

```bash
make up-build       # equivale a: docker compose up -d --build
```

4. Verificar el estado agregado de la plataforma:

```bash
make health         # GET http://localhost:8080/health
```

El gateway queda disponible en `http://localhost:8080`. Todas las peticiones de la app móvil deben dirigirse a ese puerto.

### Comandos del Makefile

```bash
make up          # docker compose up -d            (levanta sin reconstruir)
make up-build    # docker compose up -d --build     (reconstruye imágenes)
make down        # docker compose down              (detiene los contenedores)
make clean       # docker compose down -v           (detiene y BORRA los volúmenes/datos)
make logs        # docker compose logs -f           (sigue los logs de todos)
make ps          # docker compose ps                (estado de los contenedores)
make health      # consulta http://localhost:8080/health
```

### Panel de RabbitMQ

El panel de administración de RabbitMQ queda expuesto en `http://localhost:15672` (usuario/clave por defecto: `guest` / `guest`).

## Variables de Entorno

El único secreto requerido a nivel raíz (`.env`) es el JWT compartido:

```
# Secreto JWT COMPARTIDO: identity lo usa para FIRMAR, el resto para VERIFICAR.
JWT_SECRET=changeme
```

Opcionalmente pueden definirse el admin inicial que siembra `identity`:

```
ADMIN_EMAIL=admin@sched.sync
ADMIN_PASS=admin123
```

El resto de la configuración (hosts de BD, puertos, URLs entre servicios) está declarada en [docker-compose.yml](docker-compose.yml). Cada servicio recibe, entre otras:

- `SERVICE_NAME`, `PORT`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_DIALECT`
- `JWT_SECRET`
- URLs de los servicios con los que se comunica (`ACADEMICO_URL`, `ESPACIOS_URL`, `HORARIOS_URL`, `RESERVAS_URL`, ...)
- `AMQP_URL` (en `reservas` e `incidencias`)

## Estructura del Proyecto

```
api-shedsync/
├── docker-compose.yml      # Orquestación: gateway + 6 servicios + 6 Postgres + RabbitMQ
├── Makefile                # Atajos (up, down, logs, health, ...)
├── .env.example            # JWT_SECRET compartido
│
├── gateway/                # API Gateway (proxy, CORS, rate-limit, /health agregado)
│   ├── src/index.ts        # Mapa de rutas públicas -> servicio destino
│   ├── Dockerfile
│   └── package.json
│
├── services/
│   ├── identity/           # Auth, usuarios, roles
│   ├── academico/          # Carreras, semestres, asignaturas, estudiantes
│   ├── espacios/           # Espacios, equipos, disponibilidad
│   ├── horarios/           # Horarios, conflictos, importación XLSX
│   ├── reservas/           # Reservas y aprobaciones (publica eventos)
│   └── incidencias/        # Incidencias (publica eventos)
│       └── src/
│           ├── server.ts        # Punto de entrada (arranca el servidor)
│           ├── app.ts           # Construye la app Express base (+ /health)
│           ├── config.ts        # Lectura de variables de entorno
│           ├── db.ts            # Conexión Sequelize a su propia BD
│           ├── routes.ts        # Definición de rutas del servicio
│           ├── controllers/     # Lógica de negocio (en algunos servicios)
│           ├── models/          # Modelos Sequelize propios del servicio
│           ├── middlewares/     # auth (verificación JWT), onlyAdmin, ...
│           ├── clients/         # Clientes HTTP hacia otros servicios
│           └── events.ts        # Publicación a RabbitMQ (reservas/incidencias)
│
└── database/               # Activos de datos compartidos (XLSX, parsers, seeds legacy)
    ├── horarios/           # Archivos XLSX de horarios para importar
    ├── parsers/            # Parsers de XLSX
    └── seeds/              # Scripts de poblado iniciales
```

Cada servicio es un proyecto Bun/TypeScript independiente con su propio `package.json`, `Dockerfile` y `tsconfig.json`. Los scripts comunes en cada servicio:

```bash
bun start        # inicia el servidor (bun run src/server.ts)
bun run dev      # modo desarrollo con recarga (bun --watch)
bun run typecheck# verificación de tipos (tsc --noEmit)
```

## Endpoints

Todas las rutas se consumen **a través del gateway** en `http://localhost:8080`. El gateway las enruta al servicio correspondiente según el prefijo (sin reescribir el path).

### Enrutamiento del gateway

| Prefijo público | Servicio destino |
|---|---|
| `/api/auth`, `/api/usuario` | identity |
| `/api/carrera`, `/api/estudiante` | academico |
| `/api/espacio/reservar`, `/api/reservas` | reservas |
| `/api/espacio` | espacios |
| `/api/horario` | horarios |
| `/api/incidencia` | incidencias |
| `/health` | gateway (agregado de todos los servicios) |

> El orden importa: `reservas` captura `/api/espacio/reservar*` **antes** que `espacios` capture `/api/espacio`.

### identity — Autenticación y usuarios

```
POST   /api/auth/login              - Iniciar sesión (devuelve JWT)
POST   /api/auth/register           - Registrar nuevo usuario
POST   /api/auth/seed-admin         - Crear admin inicial (idempotente)
GET    /api/usuario                 - Usuario autenticado + datos académicos
PUT    /api/usuario/perfil          - Actualizar perfil propio
POST   /api/usuario/:id/asignar-rol - Asignar rol a un usuario
```

### academico — Carreras, semestres, estudiantes

```
GET    /api/carrera                 - Listar carreras
GET    /api/carrera/:id             - Obtener carrera por ID
GET    /api/carrera/:id/semestre    - Semestres de una carrera (con asignaturas)
POST   /api/carrera                 - Crear carrera (idempotente)
PUT    /api/carrera/:id             - Actualizar carrera
DELETE /api/carrera/:id             - Eliminar carrera

GET    /api/estudiante              - Estudiante autenticado
GET    /api/estudiante/all          - Listar estudiantes
GET    /api/estudiante/by-usuario/:id_usuario   - Estudiante por usuario (composición)
GET    /api/estudiante/:id/semestres            - Semestres del estudiante
GET    /api/estudiante/:id/asignaturas          - Asignaturas distintas del estudiante
POST   /api/estudiante                          - Crear estudiante
POST   /api/estudiante/:id/semestres            - Asignar asignaturas/semestre
PUT    /api/estudiante/:id                       - Actualizar estudiante
```

(academico expone además catálogos internos: `/api/tipo-carrera`, `/api/semestre`, `/api/profesor`, `/api/asignatura`.)

### espacios — Espacios y disponibilidad

```
GET    /api/espacio                 - Listar espacios (filtros ?tipo= &search=)
GET    /api/espacio/disponibles     - Disponibilidad (composición horarios + reservas)
GET    /api/espacio/:id             - Obtener espacio por ID
GET    /api/espacio/:id/exists      - Validar existencia (consumido por otros servicios)
GET    /api/espacio/:id/equipos     - Equipos de un laboratorio
POST   /api/espacio                 - Crear espacio (idempotente)
PUT    /api/espacio/:id             - Actualizar espacio
DELETE /api/espacio/:id             - Eliminar espacio
```

### horarios — Horarios e importación

```
GET    /api/horario                         - Listar horarios (filtro ?dia=)
GET    /api/horario/conflicto               - Detectar solapamiento (consumido por reservas)
GET    /api/horario/estudiante/:id          - Horarios del estudiante
GET    /api/horario/estudiante/:id/semanal  - Horario semanal completo
GET    /api/horario/:id/estudiante          - Horario enriquecido (asignatura + espacio)
POST   /api/horario/import                  - Importar uno o varios XLSX (base64)
```

### reservas — Reservas y aprobaciones

```
GET    /api/reservas                 - Listar reservas (filtros ?fecha= &estado=)
POST   /api/reservas                 - Crear reserva (valida espacio -> insert -> publica evento)
PUT    /api/reservas/:id/cancelar    - Cancelar reserva
PATCH  /api/reservas/:id/cancelar    - Cancelar reserva (alias)

POST   /api/espacio/reservar            - Solicitar reserva (autenticado)
GET    /api/espacio/reservar/pendientes - Reservas pendientes (admin)
PATCH  /api/espacio/reservar/:id/estado - Aprobar/rechazar reserva (admin)
```

### incidencias — Reporte de incidencias

```
POST   /api/incidencia              - Crear incidencia (autenticado)
GET    /api/incidencia/count        - Conteo por tipo
GET    /api/incidencia              - Listar incidencias (admin)
GET    /api/incidencia/:id          - Obtener incidencia por ID
PATCH  /api/incidencia/:id/estado   - Actualizar estado (admin)
```

## Autenticación y Autorización

La autenticación es **stateless** mediante JWT:

1. El cliente se registra o inicia sesión en **identity** (`/api/auth`).
2. **identity** firma un token JWT con el `JWT_SECRET` compartido.
3. El cliente incluye el token en cada petición: `Authorization: Bearer <token>`.
4. El gateway enruta la petición; el servicio destino **verifica** el token con el mismo secreto (middleware `auth` en `src/middlewares/`).
5. Para acciones administrativas se aplica además `onlyAdmin`.

Como el secreto es compartido, cualquier servicio puede validar el token sin llamar a `identity` en cada request.

## Comunicación entre Servicios

### Síncrona (HTTP)

Cuando un servicio necesita datos de otro durante un request, usa un cliente HTTP (`src/clients/`):

- **espacios** → consulta **horarios** y **reservas** para calcular `/api/espacio/disponibles`.
- **horarios** → consulta **academico** (asignaturas) y **espacios** (datos del espacio) para enriquecer los horarios.
- **reservas** → valida el espacio contra **espacios** y consulta **horarios** para detectar conflictos.
- **identity** → compone los datos académicos del usuario consultando **academico**.

Estas llamadas aplican **degradación elegante**: si la dependencia falla, se devuelven valores vacíos en lugar de propagar el error.

### Asíncrona (RabbitMQ)

**reservas** e **incidencias** publican eventos de dominio al exchange topic `schedsync.events` (p. ej. `reserva.creada`), con mensajes persistentes. Esto desacopla a los productores de eventuales consumidores. Si RabbitMQ no está disponible, el servicio lo registra y continúa con la publicación de eventos deshabilitada.

## Health Checks

- Cada servicio expone `GET /health` → `{ service, status, uptime }`.
- El gateway expone `GET /health` agregando el estado de todos los servicios:

```bash
curl -s http://localhost:8080/health
# { "gateway": "ok", "services": { "identity": "ok", "academico": "ok", ... } }
```

## Importación de Horarios

El servicio **horarios** acepta archivos XLSX (codificados en base64) por `POST /api/horario/import`. Durante la importación orquesta la creación idempotente de entidades relacionadas en **academico** (carreras, semestres, asignaturas, profesores) y en **espacios** (espacios), vía HTTP. Hay archivos XLSX de ejemplo en [database/horarios/](database/horarios/).

## Soporte

Para reportar bugs o sugerir mejoras, abre un issue en el repositorio.

## Changelog

### Versión 2.0.0 — Migración a microservicios

- Descomposición del monolito en **6 servicios** (identity, academico, espacios, horarios, reservas, incidencias).
- **Database-per-service**: cada servicio con su propia base PostgreSQL.
- **API Gateway** como único punto de entrada (proxy, CORS, rate-limit, health agregado).
- Comunicación **síncrona por HTTP** (clientes con degradación elegante) y **asíncrona por RabbitMQ** (exchange `schedsync.events`).
- Migración del runtime a **Bun + TypeScript**.
- Orquestación con **Docker Compose** y atajos en `Makefile`.

### Versión 1.0.0 — Monolito (legacy)

- Lanzamiento inicial como API REST monolítica (Express + Sequelize + PostgreSQL).
- Módulos base de autenticación, horarios y espacios.
- Documentación Swagger.
