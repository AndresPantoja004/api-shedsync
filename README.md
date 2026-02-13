# API ShedSync

API REST para la gestión de horarios y reservas de espacios educativos. Sistema diseñado para instituciones académicas que requieren organizar horarios de clases, profesores, estudiantes y espacios disponibles.

## Descripcion General

ShedSync es una API de gestión de horarios desarrollada para la aplicación móvil del mismo nombre. Proporciona endpoints para:

- Autenticación y autorización de usuarios
- Gestión de carreras y semestres
- Administración de horarios y asignaturas
- Control de espacios y equipamiento
- Reserva de espacios
- Registro de incidencias
- Gestión de estudiantes y profesores

## Características

- API REST con Express.js
- Autenticación basada en JWT
- Base de datos relacional con Sequelize ORM
- Control de acceso basado en roles (RBAC)
- Documentación interactiva con Swagger
- Importación de datos desde archivos XLSX
- Gestión de relaciones complejas entre entidades

## Requisitos Previos

- Node.js (versión 14 o superior)
- PostgreSQL (versión 10 o superior)
- npm o yarn

## Instalacion

1. Clonar el repositorio:

```bash
git clone <repository-url>
cd api-shedsync
```

2. Instalar dependencias:

```bash
npm install
```

3. Configurar variables de entorno:

```bash
cp .env.example .env
```

4. Configurar la base de datos en el archivo .env:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=shedsync
DB_USE=postgres
```

5. Crear las tablas de la base de datos:

```bash
npm run create-tables
```

6. (Opcional) Poblar la base de datos con datos iniciales:

```bash
npm run insert-data
```

## Configuracion

### Variables de Entorno

Se requieren las siguientes variables de entorno en el archivo `.env`:

```
# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=
DB_NAME=shedsync
DB_USE=postgres

# JWT
JWT_SECRET=your_secret_key

# API
PORT=3000
NODE_ENV=development
```

## Estructura del Proyecto

```
api-shedsync/
├── controllers/          # Controladores de negocio
│   ├── auth/
│   ├── carrera/
│   ├── espacio/
│   ├── estudiante/
│   ├── horario/
│   ├── incidencia/
│   ├── laboratorio/
│   ├── reserva/
│   └── usuario/
├── database/            # Configuracion y scripts de BD
│   ├── create_tables.js
│   ├── db_conection.js
│   ├── parsers/         # Parsers para importar datos
│   └── seeds/           # Scripts de poblado de datos
├── middlewares/         # Middleware personalizado
│   └── auth.middleware.js
├── models/              # Modelos de Sequelize
│   ├── Asignatura.js
│   ├── Carrera.js
│   ├── Equipo.js
│   ├── Espacio.js
│   ├── Estudiante.js
│   ├── EstudianteSemestre.js
│   ├── Horario.js
│   ├── Incidencia.js
│   ├── Profesor.js
│   ├── Reserva.js
│   ├── Rol.js
│   ├── Semestre.js
│   ├── TipoCarrera.js
│   ├── TipoEstudiante.js
│   ├── Usuario.js
│   ├── UsuarioRol.js
│   └── index.js
├── routes/              # Definicion de rutas
│   ├── auth/
│   ├── carrera/
│   ├── espacio/
│   ├── estudiante/
│   ├── horario/
│   ├── incidencia/
│   ├── reserva/
│   └── usuario/
├── index.js             # Punto de entrada de la aplicacion
├── swagger.js           # Configuracion de Swagger
├── swagger.json         # Documentacion Swagger
├── package.json
├── Dockerfile
└── README.md
```

## Modelos de Datos

### Entidades Principales

- **Usuario**: Representa usuarios del sistema con autenticacion
- **Rol**: Define permisos y accesos del sistema
- **UsuarioRol**: Relacion muchos-a-muchos entre usuarios y roles
- **Carrera**: Programas academicos ofrecidos
- **TipoCarrera**: Clasificacion de carreras
- **Semestre**: Periodos academicos dentro de una carrera
- **Asignatura**: Cursos u materias
- **Profesor**: Informacion de docentes vinculados a usuarios
- **Estudiante**: Informacion de alumnos vinculados a usuarios
- **EstudianteSemestre**: Relacion estudiante-semestre
- **Espacio**: Aulas, laboratorios, espacios fisicos
- **Equipo**: Equipamiento disponible en espacios
- **Horario**: Horarios de clases y asignaturas
- **Reserva**: Reservas de espacios
- **Incidencia**: Reportes de problemas o eventos

## Endpoints Principales

### Autenticacion

```
POST   /api/auth/login          - Iniciar sesion
POST   /api/auth/register       - Registrar nuevo usuario
POST   /api/auth/refresh        - Renovar token JWT
```

### Carreras

```
GET    /api/carrera             - Listar carreras
GET    /api/carrera/:id         - Obtener carrera por ID
POST   /api/carrera             - Crear carrera
PUT    /api/carrera/:id         - Actualizar carrera
DELETE /api/carrera/:id         - Eliminar carrera
```

### Horarios

```
GET    /api/horario             - Listar horarios
GET    /api/horario/:id         - Obtener horario por ID
POST   /api/horario             - Crear horario
PUT    /api/horario/:id         - Actualizar horario
DELETE /api/horario/:id         - Eliminar horario
```

### Espacios

```
GET    /api/espacio             - Listar espacios
GET    /api/espacio/:id         - Obtener espacio por ID
POST   /api/espacio             - Crear espacio
PUT    /api/espacio/:id         - Actualizar espacio
DELETE /api/espacio/:id         - Eliminar espacio
```

### Estudiantes

```
GET    /api/estudiante          - Listar estudiantes
GET    /api/estudiante/:id      - Obtener estudiante por ID
POST   /api/estudiante          - Crear estudiante
PUT    /api/estudiante/:id      - Actualizar estudiante
DELETE /api/estudiante/:id      - Eliminar estudiante
```

### Reservas

```
GET    /api/reservas            - Listar reservas
GET    /api/reservas/:id        - Obtener reserva por ID
POST   /api/reservas            - Crear reserva
PUT    /api/reservas/:id        - Actualizar reserva
DELETE /api/reservas/:id        - Eliminar reserva
```

### Incidencias

```
GET    /api/incidencia          - Listar incidencias
GET    /api/incidencia/:id      - Obtener incidencia por ID
POST   /api/incidencia          - Crear incidencia
PUT    /api/incidencia/:id      - Actualizar incidencia
DELETE /api/incidencia/:id      - Eliminar incidencia
```

### Usuarios

```
GET    /api/usuario             - Listar usuarios
GET    /api/usuario/:id         - Obtener usuario por ID
POST   /api/usuario             - Crear usuario
PUT    /api/usuario/:id         - Actualizar usuario
DELETE /api/usuario/:id         - Eliminar usuario
```

## Autenticacion y Autorizacion

La API utiliza JWT (JSON Web Tokens) para autenticacion. El middleware de autenticacion se encuentra en [middlewares/auth.middleware.js](middlewares/auth.middleware.js).

Flujo de autenticacion:

1. El usuario se registra o inicia sesion
2. Se genera un token JWT
3. El cliente incluye el token en el header `Authorization: Bearer <token>`
4. El servidor valida el token en cada peticion protegida
5. Se asignan permisos segun los roles del usuario

## Scripts Disponibles

```bash
npm start              # Inicia el servidor en modo produccion
npm run dev            # Inicia el servidor en modo desarrollo con nodemon
npm run create-tables  # Crea las tablas de la base de datos
npm run insert-data    # Inserta datos iniciales desde archivos XLSX
npm test               # Ejecuta los tests (no configurado aun)
```

## Documentacion API

La documentacion interactiva de la API se encuentra disponible en:

```
http://localhost:3000/docs
```

Esta documentacion se genera automaticamente desde el archivo [swagger.json](swagger.json) y puede ser actualizada con [swagger.js](swagger.js).

## Tecnologias Utilizadas

- **Express.js**: Framework web
- **Sequelize**: ORM para NodeJS
- **PostgreSQL**: Base de datos relacional
- **JWT**: Autenticacion y autorizacion
- **Bcrypt**: Hash de contraseñas
- **XLSX**: Importacion de datos desde archivos Excel
- **Swagger/OpenAPI**: Documentacion de API
- **Nodemon**: Reinicio automatico durante desarrollo
- **CORS**: Control de acceso entre dominios
- **Dotenv**: Manejo de variables de entorno

## Desarrollo

Para ejecutar en modo desarrollo con reinicio automatico:

```bash
npm run dev
```

El servidor se iniciara en `http://localhost:3000`

## Despliegue

### Con Docker

```bash
docker build -t api-shedsync .
docker run -p 3000:3000 --env-file .env api-shedsync
```

## Soporte

Para reportar bugs o sugerir mejoras, por favor abre un issue en el repositorio.

## Changelog

### Version 1.0.0

- Lanzamiento inicial
- Implementacion de modulos base de autenticacion, horarios y espacios
- Integracion con PostgreSQL y Sequelize
- Documentacion Swagger
