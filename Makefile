# Variables de entorno
DOCKER_COMPOSE = docker-compose
COMPOSE_FILE = docker-compose.yml

# Test Backend
test-backend:
	npm run test --prefix backend

# Test Frontend
test-frontend:
	npm run test --prefix frontend

# Ejecutar todos los tests (backend y frontend)
test: test-backend test-frontend

# Lint Backend
lint-backend:
	npm run lint --prefix backend

# Lint Frontend
lint-frontend:
	npm run lint --prefix frontend

# Ejecutar linting en ambos (backend y frontend)
lint: lint-backend lint-frontend

# Construir el Frontend
build-frontend:
	npm run build --prefix frontend

# Iniciar la base de datos en Docker
db-start:
	$(DOCKER_COMPOSE) up -d db

# Detener la base de datos en Docker
db-stop:
	$(DOCKER_COMPOSE) stop db

# Ejecutar entorno completo (Frontend, Backend, y DB)
start:
	$(DOCKER_COMPOSE) up -d

# Detener todos los servicios
stop:
	$(DOCKER_COMPOSE) down

# Reiniciar el entorno de contenedores
restart:
	$(DOCKER_COMPOSE) down && $(DOCKER_COMPOSE) up -d

# Ver logs de todos los contenedores
logs:
	$(DOCKER_COMPOSE) logs -f

# Verificar el estado de los contenedores
status:
	$(DOCKER_COMPOSE) ps

# Construir imágenes de Docker para todos los servicios
build:
	$(DOCKER_COMPOSE) build

# Limpiar imágenes y contenedores no utilizados
clean:
	docker system prune -f

# Ayuda
help:
	@echo "Comandos disponibles:"
	@echo "  test-backend       - Ejecuta tests en el backend"
	@echo "  test-frontend      - Ejecuta tests en el frontend"
	@echo "  test               - Ejecuta tests en backend y frontend"
	@echo "  lint-backend       - Ejecuta linting en el backend"
	@echo "  lint-frontend      - Ejecuta linting en el frontend"
	@echo "  lint               - Ejecuta linting en backend y frontend"
	@echo "  build-frontend     - Construye el frontend"
	@echo "  db-start           - Inicia solo la base de datos"
	@echo "  db-stop            - Detiene solo la base de datos"
	@echo "  start              - Inicia todos los servicios con Docker Compose"
	@echo "  stop               - Detiene todos los servicios"
	@echo "  restart            - Reinicia todos los servicios"
	@echo "  logs               - Muestra los logs de los servicios"
	@echo "  status             - Verifica el estado de los contenedores"
	@echo "  build-docker       - Construye imágenes de Docker para los servicios"
	@echo "  clean              - Limpia imágenes y contenedores no utilizados"
	@echo "  help               - Muestra esta ayuda"