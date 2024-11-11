# labCMS
Proyecto sobre desarrollo de sistema de gestión de contenido de laboratorios para la asignatura Cloud Computing


## Descripción

Este proyecto es una aplicación web para la gestión de los laboratorios de la universidad. La plataforma permite a los administradores centralizar la información de cada laboratorio, garantizando coherencia y precisión en la gestión de recursos, proyectos, objetivos y más.

Desplegar este proyecto en la nube aumenta su usabilidad, permitiendo un acceso centralizado, disponibilidad continua y escalabilidad. La implementación en la nube garantiza que los usuarios puedan acceder a la plataforma desde cualquier lugar, ofreciendo mayor flexibilidad y reduciendo la necesidad de infraestructura local. Además, facilita la colaboración entre los diferentes actores involucrados, como administradores y alumnos, y asegura una gestión eficiente de los recursos tecnológicos.

La aplicación está desarrollada en **Node.js** utilizando **Express** como framework, y está orientada a mejorar la organización y el acceso a la información de los laboratorios. Además, proporciona un acceso restringido a alumnos, quienes pueden visualizar información relevante pero tienen menos permisos que los administradores.

## Características Principales

- **Gestión Centralizada**: La aplicación permite a los administradores actualizar la información de los laboratorios, incluyendo objetivos, proyectos actuales, y otros detalles.
- **Roles de Usuario**: La plataforma ofrece diferentes niveles de acceso para **administradores** y **alumnos**. Los administradores tienen control total sobre la información de los laboratorios, mientras que los alumnos tienen acceso limitado.
- **Actualización Fácil**: Facilita la actualización de datos y asegura que todos los laboratorios compartan información coherente.

## Producto Mínimo Viable

El producto mínimo viable de este proyecto incluye un sistema para diferenciar entre los distintos tipos de usuario. El tipo de usuario 
administrador tendrá la posibilidad de gestionar los laboratorios y los proyectos que se realizan en cada uno mientras que los alumnos 
tendrán una interfaz para poder ver la información de cada laboratorio junto con sus proyectos.

## Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución para el desarrollo del backend.
- **Express**: Framework para la construcción de la API y gestión de rutas.
- **JavaScript**: Tecnologías frontend para la interfaz del usuario.

## Roles

- **Administradores**: Pueden crear, editar y eliminar información sobre los laboratorios, actualizar objetivos y gestionar proyectos.
- **Alumnos**: Pueden acceder a información básica de los laboratorios, como objetivos y proyectos actuales, pero no tienen permisos de edición.

## Historias de usuario

- Un administrador quiere gestionar los laboratorios, creando y modificando los proyectos a realizar en el mismo. También quiere gestionar información del laboratorio como horarios, fotografías, etc.
- Un estudiante quiere ver una lista con los laboratorios disponibles y al seleccionar uno, ver los diferentes proyectos que se realizan en el mismo.

## Licencia

Este proyecto está licenciado bajo la licencia MIT. Para más información, consulta el archivo [LICENSE](https://https://github.com/javiimartin/labCMS/blob/main/LICENSE).

## Contribuciones

Las contribuciones son bienvenidas. Si deseas contribuir, por favor abre un  [issue](https://github.com/javiimartin/labCMS/issues/new) en el repositorio.
