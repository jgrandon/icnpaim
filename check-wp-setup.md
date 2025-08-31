# WordPress Setup Checklist

## Pasos para verificar que WordPress está configurado correctamente:

### 1. Verificar que el código PHP está activo

**Opción A: Añadir al functions.php del tema activo**
```php
// Al final de wp-content/themes/tu-tema/functions.php
require_once get_template_directory() . '/lti-integration.php';
```

**Opción B: Crear como plugin**
1. Crear archivo: `wp-content/plugins/lti-integration/lti-integration.php`
2. Añadir header de plugin:
```php
<?php
/**
 * Plugin Name: LTI Integration
 * Description: Integración LTI con Node.js
 * Version: 1.0.0
 */

// Aquí va todo el código de functions-wordpress-lti-complete.php
```
3. Activar el plugin en wp-admin

### 2. Verificar endpoints

Visita estos URLs en tu navegador:

1. **Ping LTI**: https://icnpaim.cl/wp-json/lti/v1/ping
   - Debe devolver JSON con status: "ok"

2. **CPT Student**: https://icnpaim.cl/wp-json/wp/v2/student
   - Debe devolver array (puede estar vacío)

3. **CPT Course**: https://icnpaim.cl/wp-json/wp/v2/course
   - Debe devolver array (puede estar vacío)

### 3. Verificar autenticación

Si usas Application Passwords:
```bash
curl -u "usuario:password-de-aplicacion" https://icnpaim.cl/wp-json/wp/v2/users/me
```

### 4. Verificar logs

En wp-admin → Tools → Site Health → Info → Server
- Verificar que error_log está habilitado
- Logs suelen estar en: wp-content/debug.log

### 5. Test desde Node.js

```bash
# Desde el servidor Node.js
node test-wp-direct.js
```

### 6. Variables de entorno necesarias

```bash
# En Railway, añadir estas variables:
WP_API_BASE=https://icnpaim.cl/wp-json/wp/v2
WORDPRESS_API_USER=tu-usuario-wp
WORDPRESS_API_PASSWORD=tu-application-password
```

## Problemas comunes:

1. **404 en endpoints**: El código PHP no está activo
2. **401/403**: Credenciales incorrectas o permisos insuficientes  
3. **500**: Error en el código PHP (revisar debug.log)
4. **CORS**: Añadir headers en WordPress si es necesario

## Verificación rápida:

1. ¿Funciona https://icnpaim.cl/wp-json/lti/v1/ping?
2. ¿Funciona https://icnpaim.cl/wp-json/wp/v2/student?
3. ¿Están configuradas las variables de entorno en Railway?