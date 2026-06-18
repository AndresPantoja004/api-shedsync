#!/usr/bin/env bash
# Reemplazo de seed_adminUser.js para la arquitectura de microservicios.
# Dispara el seed idempotente del admin inicial en el servicio identity vía el gateway.
# Las credenciales salen de ADMIN_EMAIL / ADMIN_PASS del entorno del servicio identity.
set -euo pipefail

GATEWAY_URL="${GATEWAY_URL:-http://localhost:8080}"

echo "→ Sembrando admin inicial ..."
curl -fsS -X POST "$GATEWAY_URL/api/auth/seed-admin" -H 'Content-Type: application/json'
echo
echo "✅ Seed admin finalizado"
