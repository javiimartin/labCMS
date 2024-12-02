# Hito 3: Diseño de microservicios

## Framework Elegido para el Microservicio: Node.js con Express

El framework seleccionado para el desarrollo del microservicio ha sido Node.js con Express, debido a las siguientes razones:

- **Flexibilidad y Simplicidad:** Express es un framework minimalista que permite implementar APIs REST de manera sencilla, lo que se alinea con los requisitos del hito.
- **Ecosistema Amplio:** La comunidad activa y el amplio ecosistema de paquetes npm facilitan la integración de herramientas como Swagger para la documentación y Winston para los logs.
- **Rendimiento:** Node.js utiliza un modelo de I/O no bloqueante, ideal para aplicaciones basadas en microservicios donde la concurrencia y la eficiencia son esenciales.
- **Curva de Aprendizaje:** Al ser un framework ampliamente utilizado, su curva de aprendizaje es menor, lo que favorece el desarrollo ágil y colaborativo.


## Estructura de la aplicación

La estructura del microservicio se ha diseñado para desacoplar la lógica de negocio de la API, siguiendo un enfoque modular que facilita la escalabilidad, mantenibilidad y prueba del código. A continuación, se detalla la estructura utilizada:

- **Carpeta routes:** Contiene las definiciones de los endpoints de la API. Aquí se configura cómo las solicitudes HTTP son manejadas y se delegan a los controladores correspondientes. Esta separación permite que los endpoints sean independientes de la lógica de negocio, centrando su responsabilidad en la definición de rutas.

- **Carpeta services:** Alberga la lógica de negocio de la aplicación. Esta capa encapsula todas las operaciones complejas y es la responsable de ejecutar las funcionalidades principales, lo que garantiza que la lógica de negocio no se mezcle con la lógica de la API.

- **Carpeta controllers:** Actúa como intermediario entre las rutas y los servicios. Los controladores reciben las solicitudes desde las rutas, procesan los datos necesarios y delegan las operaciones al servicio correspondiente. Esta capa asegura la separación de preocupaciones y facilita la reutilización del código.

- **Carpeta utils:** Incluye funciones reutilizables y utilidades necesarias para el microservicio, como el archivo logger.js que configura el sistema de logs. Esta carpeta centraliza funciones auxiliares que pueden ser usadas en diferentes partes de la aplicación, evitando la duplicación de código.


#### Beneficio del Diseño Modular
Gracias a esta estructura, se logra un alto grado de desacoplamiento. La lógica de negocio no depende directamente de las rutas o controladores, lo que facilita:

La prueba unitaria de cada capa.
La reutilización del código en otros proyectos o microservicios.
La mantenibilidad al permitir modificaciones aisladas en cada capa sin afectar a las demás.


## Documentación de la API: Swagger
La documentación de la API se ha realizado utilizando Swagger, una herramienta que permite generar documentación interactiva y autoexplicativa.

### Justificación
- **Interfaz Amigable:** Swagger ofrece una interfaz gráfica que facilita la exploración y prueba de los endpoints por parte de los desarrolladores.
- **Estandarización:** Al seguir el estándar OpenAPI, la documentación es clara y compatible con otras herramientas del ecosistema.
- **Automatización:** Swagger permite generar documentación directamente a partir del código, ahorrando tiempo y garantizando que esté siempre actualizada.

### Implementación
Se ha configurado Swagger en el proyecto añadiendo un archivo swagger.json que describe las rutas, los parámetros de entrada y las respuestas. Esto asegura que cualquier usuario o desarrollador que consuma la API pueda comprender su funcionamiento de manera intuitiva.


## Sistema de Logs: Winston
Para registrar la actividad de la API, se ha implementado un sistema de logs utilizando Winston, una biblioteca ampliamente utilizada en aplicaciones Node.js.

### Justificación
- **Flexibilidad:** Winston permite configurar múltiples niveles de logs (info, warn, error) y escribir los registros en diferentes destinos (consola, archivo, etc.).
- **Extensibilidad:** Admite la adición de transportes personalizados, lo que facilita la integración con servicios como AWS CloudWatch o ElasticSearch.
- **Facilidad de Uso:** Su API es sencilla y permite configurar rápidamente un sistema de logs eficiente.

### Implementación
Se creó un archivo logger.js en la carpeta utils para centralizar la configuración de Winston. Los logs registran:

- Solicitudes entrantes, indicando la ruta y el método HTTP.
- Respuestas enviadas, incluyendo el código de estado.
- Errores capturados, facilitando la depuración.

Esta implementación asegura que la actividad de la API quede registrada, mejorando la trazabilidad y el mantenimiento.


## Pruebas de la API
Se han desarrollado pruebas exhaustivas para garantizar el correcto funcionamiento de la API. Estas pruebas cubren los endpoints definidos, asegurando que cada operación devuelve las respuestas esperadas y maneja adecuadamente los casos de error.

### Modificaciones en las Pruebas
Las pruebas del hito anterior se han adaptado al diseño actual de la API, ajustándolas a la nueva estructura y lógica de negocio. Se ha utilizado una biblioteca como Jest para ejecutar las pruebas, dado su rendimiento y facilidad de configuración.

### Cobertura de las Pruebas
- Pruebas unitarias para los servicios.
- Pruebas de integración para los endpoints de la API.
- Validación de respuestas para diferentes casos de entrada, incluyendo entradas válidas e inválidas.

El enfoque de pruebas asegura que la API sea robusta y cumpla con los requisitos funcionales y no funcionales.

