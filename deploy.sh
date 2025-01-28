#!/bin/bash

# Configuración de variables
KEY_FILE="./key.json"
PROJECT_ID="attendancerecords"
DOCKERFILE_PATH="./backend/docker/Dockerfile.dev"
CONTEXT_PATH="./backend"
SERVICE_NAME="labs-cms"
REGION="europe-southwest1"
REPO_NAME="labs-cms-repo"
IMAGE_NAME="labs-cms-img"
IMAGE_TAG="v1"
ARTIFACT_REGISTRY_HOST="$REGION-docker.pkg.dev"
FULL_IMAGE_NAME="$ARTIFACT_REGISTRY_HOST/$PROJECT_ID/$REPO_NAME/$IMAGE_NAME:$IMAGE_TAG"

# Función para mostrar logs con timestamp
log() {
    echo -e "\e[1;34m[$(date +'%Y-%m-%d %H:%M:%S')] $1\e[0m"
}

log "Iniciando despliegue automatizado en Google Cloud."

# Autenticación en Google Cloud
log "Autenticando con la clave de servicio..."
gcloud auth activate-service-account --key-file=$KEY_FILE || { log "Error en la autenticación"; exit 1; }

# Configuración del proyecto (sin interactividad)
log "Configurando proyecto $PROJECT_ID..."
gcloud config set project $PROJECT_ID --quiet || { log "Error al configurar el proyecto"; exit 1; }

# Habilitar servicios necesarios
log "Habilitando servicios en Google Cloud..."
gcloud services enable artifactregistry.googleapis.com run.googleapis.com cloudbuild.googleapis.com || { log "Error al habilitar servicios"; exit 1; }

# Crear repositorio en Artifact Registry (si no existe)
log "Verificando existencia del repositorio en Artifact Registry..."
if ! gcloud artifacts repositories describe $REPO_NAME --location=$REGION >/dev/null 2>&1; then
    log "Repositorio no encontrado. Creando repositorio $REPO_NAME..."
    gcloud artifacts repositories create $REPO_NAME --repository-format=docker --location=$REGION || { log "Error al crear repositorio"; exit 1; }
else
    log "Repositorio encontrado. Continuando..."
fi

# Autenticación en Artifact Registry
log "Autenticando Docker con Artifact Registry..."
echo "ARTIFACT_REGISTRY_HOST = $ARTIFACT_REGISTRY_HOST"
gcloud auth configure-docker $ARTIFACT_REGISTRY_HOST --quiet || { log "Error en autenticación de Docker"; exit 1; }

# Construcción de la imagen Docker
log "Construyendo imagen Docker para el backend..."
docker build -t $FULL_IMAGE_NAME -f $DOCKERFILE_PATH $CONTEXT_PATH || { log "Error en la construcción de la imagen"; exit 1; }

# Subida de la imagen a Artifact Registry
log "Subiendo imagen a Artifact Registry..."
docker push $FULL_IMAGE_NAME || { log "Error al subir la imagen"; exit 1; }

# Despliegue en Cloud Run
log "Desplegando en Google Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $FULL_IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 5000 \
    --add-cloudsql-instances attendancerecords:europe-southwest1:attendance-reccords-sql \
    --set-env-vars INSTANCE_CONNECTION_NAME=attendancerecords:europe-southwest1:attendance-reccords-sql \
    --set-env-vars DB_HOST="/cloudsql/attendancerecords:europe-southwest1:attendance-reccords-sql" \
    --set-env-vars DB_USER="postgres" \
    --set-env-vars DB_PASS="password" \
    --set-env-vars DB_NAME="labs-cms_db" \
    --quiet || { log "Error en el despliegue"; exit 1; }

# 10. Obtener la URL del servicio
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')
log "Despliegue completado con éxito. La aplicación está disponible en: $SERVICE_URL"

# 11. Mostrar logs de Cloud Run
log "Mostrando logs del servicio en tiempo real..."
gcloud logging read "resource.labels.service_name=$SERVICE_NAME" --limit 10 --format json || log "No se encontraron logs."

exit 0