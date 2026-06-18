#!/usr/bin/env bash
set -euo pipefail

GATEWAY_URL="${GATEWAY_URL:-http://localhost:8080}"
DIR="$(cd "$(dirname "$0")/horarios" && pwd)"

for f in "$DIR"/HORARIO_*.xlsx; do
  nombre="$(basename "$f")"
  echo "→ Importando $nombre ..."
  b64="$(base64 -w0 "$f")"
  curl -fsS -X POST "$GATEWAY_URL/api/horario/import" \
    -H 'Content-Type: application/json' \
    -d "{\"nombre\":\"$nombre\",\"contenidoBase64\":\"$b64\"}"
  echo
done
echo "✅ Import finalizado"
