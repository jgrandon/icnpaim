# Instrucciones para Activar CPTs en WordPress

## URGENTE: Los CPTs no están registrados en WordPress

Según los logs, la conexión funciona pero los CPTs no existen. Necesitas activar el código PHP.

## Pasos OBLIGATORIOS:

### 1. Activar el código PHP en WordPress

**OPCIÓN A - Añadir al functions.php (MÁS FÁCIL):**

1. Ve a **wp-admin** → **Apariencia** → **Editor de temas**
2. Selecciona **functions.php** de tu tema activo
3. Al FINAL del archivo, añade esta línea:

```php
// LTI Integration
require_once get_template_directory() . '/lti-integration.php';
```

4. Crea un nuevo archivo llamado **lti-integration.php** en la carpeta de tu tema
5. Copia TODO el contenido del archivo `functions-wordpress-lti-complete.php` en ese nuevo archivo

**OPCIÓN B - Crear como plugin:**

1. Crear carpeta: `wp-content/plugins/lti-integration/`
2. Crear archivo: `wp-content/plugins/lti-integration/lti-integration.php`
3. Añadir header de plugin al inicio:

```php
<?php
/**
 * Plugin Name: LTI Integration
 * Description: Integración LTI con Node.js
 * Version: 1.0.0
 */

// Aquí va todo el código de functions-wordpress-lti-complete.php
```

4. Activar el plugin en **wp-admin** → **Plugins**

### 2. Verificar que funciona

Después de activar el código, visita:

1. **https://icnpaim.cl/wp-json/lti/v1/ping**
   - Debe devolver JSON con `"status": "ok"`

2. **https://icnpaim.cl/wp-json/wp/v2/student**
   - Debe devolver array (puede estar vacío)

3. En **wp-admin**, deberías ver nuevos menús:
   - Estudiantes
   - Cursos  
   - Unidades
   - Progreso
   - Notas

### 3. Configurar variables en Railway

En Railway → Variables, añadir:

```
WP_API_BASE=https://icnpaim.cl/wp-json/wp/v2
WORDPRESS_API_USER=tu-usuario-wp
WORDPRESS_API_PASSWORD=tu-application-password
```

### 4. Crear unidades de ejemplo

Una vez que los CPTs estén activos:

1. Ve a **wp-admin** → **Cursos** → **Agregar nuevo**
2. Título: "Curso de Prueba"
3. Guardar

4. Ve a **Unidades** → **Agregar nueva**
5. Título: "Unidad 1: Introducción"
6. En el metabox "Configuración del Curso", selecciona el curso creado
7. En "Cards JSON", pega:

```json
[
  {
    "id": "card-1",
    "title": "Video: Introducción",
    "url": "https://youtube.com/watch?v=dQw4w9WgXcQ",
    "tipoActividad": "video",
    "color": "#e53e3e",
    "peso": 1,
    "estado": "pendiente"
  },
  {
    "id": "card-2",
    "title": "Quiz: Evaluación",
    "url": "https://forms.gle/example",
    "tipoActividad": "quiz",
    "color": "#d69e2e",
    "peso": 2,
    "estado": "pendiente"
  }
]
```

8. Guardar

### 5. Test final

Visita: **https://lti.icnpaim.cl/test-wp**

Esto verificará toda la conectividad.

## ¿Qué hacer AHORA?

1. **PRIMERO**: Activa el código PHP usando la Opción A o B
2. **SEGUNDO**: Verifica que https://icnpaim.cl/wp-json/lti/v1/ping funciona
3. **TERCERO**: Crea una unidad de ejemplo como se describe arriba
4. **CUARTO**: Haz un nuevo LTI launch desde Blackboard

Una vez hecho esto, el dashboard mostrará las unidades como cards con botón "Ver Progreso".