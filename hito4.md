# Memoria: Despliegue de un Clúster de Contenedores para LabsCMS

## Introducción
Este documento detalla el despliegue de un clúster de contenedores para la aplicación **LabsCMS**, utilizando **Docker Compose**. La infraestructura incluye tres contenedores principales: base de datos, backend y frontend. Cada contenedor tiene un propósito definido y trabaja en conjunto para garantizar un sistema modular, escalable y reproducible.

---

## Estructura del Clúster de Contenedores

### Justificación de la Estructura
El clúster está compuesto por los siguientes servicios:
1. **Base de Datos (PostgreSQL):** Almacena los datos esenciales, como información de usuarios, laboratorios y registros.
2. **Backend (Node.js):** Implementa la lógica de negocio y expone una API RESTful para el consumo de datos.
3. **Frontend (React):** Proporciona una interfaz gráfica interactiva para los usuarios.

Esta separación permite una arquitectura modular, donde cada componente puede desarrollarse, mantenerse y escalarse de forma independiente.

---

## Contenedores

### Contenedor de Base de Datos

#### Contenedor Base
El contenedor base utilizado es **Postgres:13**, una versión estable y ampliamente utilizada en sistemas de gestión de bases de datos relacionales.

#### Configuración
- **Persistencia de Datos:** Se utiliza un volumen (`db-data`) para asegurar la persistencia de los datos almacenados.
- **Variables de Entorno:** Se definen credenciales, nombre de la base de datos y otros parámetros críticos a través de variables de entorno.
- **Healthcheck:** Se utiliza el comando `pg_isready` para verificar la disponibilidad del servicio antes de que los demás servicios dependientes lo utilicen.

#### Justificación
La elección de **Postgres:13** se debe a su fiabilidad, escalabilidad y rendimiento en entornos de producción. Además, la configuración mediante volúmenes y healthchecks garantiza robustez y consistencia en el sistema.

---

### Contenedor Backend

#### Contenedor Base
El contenedor base utilizado es **Node:18**, una versión moderna que garantiza compatibilidad con las bibliotecas más recientes y un manejo eficiente de múltiples solicitudes concurrentes.

#### Dockerfile
El Dockerfile define:
1. Un directorio de trabajo `/app` para contener el código fuente.
2. La instalación de dependencias utilizando `npm install` tras copiar el archivo `package.json`.
3. La exposición del puerto **5000**, que se utiliza para acceder a la API RESTful.
4. El comando `npm start` para iniciar el servidor de Node.js.

#### Justificación
El uso de **Node:18** permite aprovechar las características y mejoras de rendimiento más recientes, garantizando que la aplicación funcione de manera óptima.

---

### Contenedor Frontend

#### Contenedor Base
El contenedor base utilizado es también **Node:18**, asegurando compatibilidad con herramientas modernas de desarrollo frontend.

#### Dockerfile
El Dockerfile para el frontend incluye:
1. Configuración del directorio de trabajo `/app`.
2. Instalación de dependencias con `npm install` tras copiar el archivo `package.json`.
3. Copia del código fuente de la aplicación React.
4. Exposición del puerto **3000**, que se utiliza para servir la interfaz gráfica.
5. Ejecución del comando `npm start` para iniciar el servidor de desarrollo de React.

#### Justificación
La elección de **Node:18** asegura un entorno moderno y alineado con las mejores prácticas de desarrollo frontend, lo que facilita la creación de una interfaz de usuario interactiva y eficiente.

---

## Configuración del Clúster de Contenedores

### Descripción del Fichero `docker-compose.yml`
El archivo `docker-compose.yml` define cómo los contenedores interactúan entre sí y con el entorno. 

#### Características Principales
1. **Red de Comunicación Interna:** Todos los contenedores están conectados mediante una red `labsCMS-network` para facilitar la comunicación segura entre servicios.
2. **Dependencias entre Servicios:** 
   - El backend depende de la base de datos para operar correctamente.
   - El frontend depende del backend para consumir los datos y servicios expuestos.
3. **Healthchecks:** Cada contenedor incluye verificaciones de salud para garantizar que los servicios estén disponibles antes de que otros dependan de ellos.
4. **Persistencia de Datos:** La base de datos utiliza un volumen (`db-data`) para almacenar información de forma persistente.

#### Flujo del Clúster
1. **Base de Datos:** Se levanta primero para garantizar que esté disponible para el backend.
2. **Backend:** Inicia después de que la base de datos esté lista, conectándose a ella mediante las credenciales definidas en las variables de entorno.
3. **Frontend:** Se inicia al final, conectándose al backend y sirviendo la interfaz gráfica al usuario.

---

## Conclusión
La infraestructura del clúster, basada en contenedores independientes para la base de datos, backend y frontend, proporciona una arquitectura modular y escalable. La configuración reproducible mediante Docker Compose asegura que el sistema pueda desplegarse y probarse fácilmente en diferentes entornos. Este enfoque modular facilita el mantenimiento, mejora y escalabilidad de la aplicación **LabsCMS**.
