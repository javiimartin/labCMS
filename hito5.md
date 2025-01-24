# Hito 5: Despliegue de la Aplicación en un PaaS

## Introducción

En este hito se ha llevado a cabo el despliegue de la aplicación de control de laboratorios en un entorno en la nube utilizando un servicio PaaS. Se ha seleccionado Google Cloud Run como plataforma para el despliegue, aprovechando la prueba gratuita de Google Cloud. Este documento describe los criterios de selección del PaaS, las herramientas utilizadas, la configuración del despliegue automatizado y el resultado final del despliegue.

## Selección del PaaS

Para la selección del PaaS se han tenido en cuenta los siguientes criterios:

- **Disponibilidad de prueba gratuita**: Google Cloud ofrece un crédito gratuito para nuevos usuarios, lo que permite desplegar y probar la aplicación sin costes iniciales.
- **Compatibilidad con despliegue automatizado desde GitHub**: Google Cloud Run permite la integración con repositorios de GitHub mediante Cloud Build y despliegues automáticos.
- **Ubicación en Europa**: Se ha seleccionado la región `europe-southwest1` para cumplir con requisitos legales y garantizar una baja latencia.
- **Escalabilidad y facilidad de despliegue**: Google Cloud Run ofrece un entorno sin servidor gestionado, facilitando la administración del despliegue y la escalabilidad automática.

## Herramientas Utilizadas

El despliegue se ha realizado utilizando las siguientes herramientas y servicios:

- **Google Cloud Run**: Servicio para ejecutar contenedores sin servidor.
- **Google Artifact Registry**: Repositorio para almacenar y gestionar las imágenes Docker.
- **Google Cloud Build**: Herramienta de CI/CD integrada con Cloud Run para despliegues automatizados.
- **Docker**: Para la creación de la imagen del backend.
- **Bash Script (`deploy.sh`)**: Automatiza la autenticación, construcción y despliegue de la aplicación.
- **GitHub**: Para el control de versiones y despliegues automáticos mediante `git push`.

## Configuración del Despliegue Automatizado

Se ha implementado un script de despliegue (`deploy.sh`) que realiza las siguientes acciones:

1. **Autenticación en Google Cloud** utilizando un archivo de credenciales `key.json`.
2. **Configuración del proyecto** en Google Cloud.
3. **Habilitación de los servicios necesarios**: `artifactregistry.googleapis.com`, `run.googleapis.com`, `cloudbuild.googleapis.com`.
4. **Creación de un repositorio en Artifact Registry** para almacenar las imágenes Docker.
5. **Autenticación de Docker con Artifact Registry**.
6. **Construcción de la imagen Docker** a partir del `Dockerfile.dev`.
7. **Subida de la imagen a Artifact Registry**.
8. **Despliegue en Google Cloud Run** permitiendo acceso público y utilizando el puerto `5000`.
9. **Obtención de la URL del servicio desplegado**.
10. **Visualización de los logs del servicio** para verificar su correcto funcionamiento.

El siguiente es un extracto del script de despliegue:

```bash
#!/bin/bash
# Configuración de variables

# Autenticación en Google Cloud
gcloud auth activate-service-account --key-file=$KEY_FILE
# Configuración del proyecto
gcloud config set project $PROJECT_ID --quiet
# Habilitar servicios necesarios
gcloud services enable artifactregistry.googleapis.com run.googleapis.com cloudbuild.googleapis.com
# Crear repositorio en Artifact Registry
gcloud artifacts repositories create $REPO_NAME --repository-format=docker --location=$REGION || true
# Autenticación en Artifact Registry
gcloud auth configure-docker $ARTIFACT_REGISTRY_HOST --quiet
# Construcción y subida de la imagen
docker build -t $FULL_IMAGE_NAME -f $DOCKERFILE_PATH $CONTEXT_PATH
docker push $FULL_IMAGE_NAME
# Despliegue en Cloud Run
gcloud run deploy $SERVICE_NAME --image $FULL_IMAGE_NAME --platform managed --region $REGION --allow-unauthenticated --port 5000 --quiet
```

## Resultado del Despliegue

El despliegue se ha realizado con éxito en Google Cloud Run. La aplicación está accesible en la siguiente URL:

https://labs-cms-551620082303.europe-southwest1.run.app/api-docs/

Se han realizado pruebas de conexión y verificación del correcto funcionamiento de la API, comprobando que responde adecuadamente a las peticiones HTTP esperadas.

## Conclusiones

El despliegue en Google Cloud Run ha permitido obtener un entorno en la nube gestionado y escalable para la aplicación de control de laboratorios. La configuración del despliegue automatizado facilita futuras actualizaciones del sistema, asegurando una integración continua eficiente.

Este proceso ha permitido adquirir experiencia en la configuración de despliegues en un PaaS y en el uso de herramientas de Google Cloud para la gestión de infraestructuras en la nube.