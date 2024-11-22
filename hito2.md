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

