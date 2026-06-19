.PHONY: up up-build down logs ps clean health

up:
	docker compose up -d
up-build:
	docker compose up -d --build
down:
	docker compose down
clean:
	docker compose down -v
logs:
	docker compose logs -f
ps:
	docker compose ps
health:
	curl -s http://localhost:8080/health | (python3 -m json.tool 2>/dev/null || cat)