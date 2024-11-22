# Hito 2: Integración continua

## Gestor de tareas

En el desarrollo del proyecto, se ha optado por el uso de npm scripts como gestor de tareas debido a su integración nativa, simplicidad y capacidad para manejar tareas comunes de manera eficiente, asegurando un entorno de desarrollo ágil y organizado. A cnotinuación se explican sus ventajas:

- **Simplicidad y versatilidad:**
npm scripts están integrados directamente en cualquier proyecto de Node.js, eliminando la necesidad de instalar y configurar herramientas adicionales como Grunt o Gulp. Esto permite un flujo de trabajo más simple y menos dependencias externas.

- **Facilidad de configuración:**
La configuración de npm scripts se realiza en el archivo package.json, donde se definen comandos personalizados para automatizar tareas. Esto facilita la comprensión y mantenimiento de los scripts por parte de cualquier miembro del equipo.

- **Compatibilidad:**
npm scripts son compatibles con múltiples sistemas operativos y se integran fácilmente con otras herramientas del ecosistema de desarrollo, como frameworks de pruebas (Jest), servidores de desarrollo (nodemon) o Docker.

- **Flexibilidad para tareas comunes:**
Las tareas configuradas incluyen comandos para ejecutar pruebas, iniciar el servidor en desarrollo, verificar el formato del código, generar documentación y realizar despliegues. Por ejemplo:


- **Estandarización:**
Usar npm scripts permite mantener consistencia en la ejecución de tareas, ya que todos los comandos se documentan en un único lugar, facilitando la colaboración entre los desarrolladores.


## Biblioteca de aserciones

En este proyecto, se ha utilizado Jest como biblioteca de aserciones debido a su simplicidad, versatilidad y capacidad para adaptarse tanto a pruebas unitarias como a pruebas de integración. Jest permite realizar comparaciones entre los valores esperados y los valores obtenidos durante la ejecución de las pruebas mediante una API intuitiva, como los métodos expect y toBe. Esta facilidad para expresar expectativas mejora la legibilidad y claridad de las pruebas, asegurando que los resultados cumplan con los requisitos definidos.

Además, Jest incluye soporte integrado para mocks y stubs, lo que permite simular dependencias externas y centrarse únicamente en la lógica interna de los módulos probados. Esto no solo reduce el ruido en las pruebas, sino que también mejora su fiabilidad y aislamiento.

## Marco de pruebas

Jest se ha elegido como el marco de pruebas principal debido a que proporciona una solución completa que incluye biblioteca de aserciones, test runner y herramientas avanzadas para el análisis de cobertura de código. Su enfoque "todo en uno" facilita la configuración y el mantenimiento, eliminando la necesidad de combinar varias herramientas para diferentes propósitos.

Jest destaca por su compatibilidad con JavaScript y su integración fluida con entornos como Node.js lo que permite usar una única herramienta para todo el ecosistema del proyecto. En este caso, su uso en el backend con Node.js ha permitido ejecutar pruebas de forma eficiente, incluyendo pruebas para verificar el comportamiento del sistema.

La configuración de Jest se ha gestionado directamente a través del archivo package.json, donde se han definido scripts como npm test para ejecutar las pruebas y jest --coverage para analizar la cobertura del código. Esta centralización simplifica su uso y facilita la automatización en pipelines de integración continua.


## Integración continua 

Para la integración continua del proyecto, se ha utilizado un archivo Makefile, que facilita la automatización de tareas esenciales como la ejecución de pruebas y la generación de reportes de cobertura. Este enfoque es sencillo y compatible con múltiples entornos, lo que asegura un flujo de trabajo uniforme para todo el equipo.

En el Makefile se han definido reglas para ejecutar los tests con Jest, abarcando pruebas unitarias e integraciones que validan tanto módulos individuales como la interacción entre componentes. Además, se generan reportes de cobertura para garantizar la calidad del código. La elección del Makefile destaca por su portabilidad y simplicidad, haciendo que sea una solución efectiva para el desarrollo y mantenimiento del proyecto.

La integración continua se ha implementado utilizando GitHub Actions, una herramienta integrada en GitHub que permite automatizar flujos de trabajo directamente desde los repositorios del proyecto. Se ha configurado un flujo de trabajo (workflow) que se ejecuta automáticamente cada vez que se realiza un push o se crea una pull request hacia la rama principal. Este workflow incluye pasos clave como la instalación de dependencias, ejecución de pruebas y la generación de un informe de cobertura.

Se ha optado por GitHub Actions debido a su integración nativa con GitHub, lo que facilita la configuración y el monitoreo de los flujos de trabajo sin necesidad de herramientas externas. Además, su flexibilidad y extensibilidad permiten personalizar el pipeline según las necesidades del proyecto. Su amplio ecosistema de actions reutilizables y la capacidad de definir flujos de trabajo en un archivo YAML simplifican la automatización de tareas como la ejecución de pruebas, análisis estático de código y despliegues.

**Configuración del workflow:**

El archivo de configuración .github/workflows/ci.yml define el pipeline de integración continua. Este archivo incluye los siguientes pasos:

- Configuración del entorno: Se especifica un sistema operativo base (Ubuntu) y se configuran las versiones necesarias de Node.js para asegurar compatibilidad con el proyecto.
- Instalación de dependencias: Mediante npm ci se instalan las dependencias requeridas para ejecutar las pruebas.
- Ejecución de pruebas: Utilizando los scripts definidos en el archivo package.json, se ejecutan las pruebas del proyecto con Jest.
- Generación de cobertura: Se genera un informe de cobertura para verificar qué porcentaje del código está cubierto por las pruebas, asegurando la calidad del mismo.
- La elección de GitHub Actions garantiza un flujo de trabajo ágil y confiable, permitiendo detectar y corregir errores rápidamente durante el desarrollo. Este enfoque asegura que el proyecto mantenga altos estándares de calidad, fomente buenas prácticas y facilite la colaboración entre desarrolladores.



## Implementación y ejecución de tests

Se han desarrollado tests unitarios e integrados para asegurar la calidad y el correcto funcionamiento de los controladores principales del proyecto: Admin Controller, Labs Controller y User Controller.

**Admin Controller:**
En el controlador de administradores, se han implementado pruebas para:

- Registro de Administradores: Verificar que se puede registrar un nuevo administrador con datos válidos y que se genera un token único. También se valida que el sistema detecte y devuelva un error si ya existe un administrador con el mismo correo.
- Inicio de Sesión: Probar que las credenciales correctas autentican al administrador y generan un token. Además, se comprueba que las credenciales incorrectas generan un mensaje de error apropiado.
- Obtención de Administradores: Validar que se recupera la lista completa de administradores excluyendo sus contraseñas.

**Labs Controller:**
Para el controlador de laboratorios, los tests cubren:

- Creación de Laboratorios: Comprobar que se puede crear un laboratorio con datos válidos, incluyendo archivos multimedia como imágenes, vídeos y podcasts, asegurando que se procesen correctamente antes de ser almacenados.
- Actualización de Laboratorios: Validar que es posible modificar un laboratorio existente, incluyendo la eliminación de archivos antiguos y la adición de nuevos elementos multimedia.
- Eliminación de Laboratorios: Verificar que un laboratorio se elimina correctamente junto con sus registros asociados y archivos multimedia del servidor.

**User Controller:**
En el controlador de usuarios, se han implementado pruebas para:

- Registro de Usuarios: Asegurar que se detectan intentos de registro con un correo ya existente y que se devuelve el mensaje de error adecuado.
- Perfil de Usuario: Validar que se puede recuperar el perfil del usuario autenticado sin incluir la contraseña y que se notifica adecuadamente si el usuario no existe.






