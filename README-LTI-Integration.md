# Integración LTI 1.3 con WordPress

## Configuración en Blackboard Learn

### 1. Registrar la aplicación en Developer Portal

1. Ir a https://developer.blackboard.com
2. Crear nueva aplicación con estos datos:
   - **Application Name**: ICNPAIM LTI Tool
   - **Description**: Herramienta LTI para gestión de cursos y progreso
   - **Domain(s)**: lti.icnpaim.cl
   - **Login Initiation URL**: https://lti.icnpaim.cl/login
   - **Tool Redirect URL(s)**: https://lti.icnpaim.cl/lti13

3. Anotar: **Application ID**, **Key**, **Secret**

### 2. Configurar en Learn

1. Como administrador, ir a **Administrator Tools** > **Integrations** > **LTI Tool Providers**
2. **Register LTI 1.3 Tool**
3. **Client ID**: usar el Application ID del Developer Portal
4. **Submit**

### 3. Crear Placement

1. En la lista de LTI Tool Providers, seleccionar tu aplicación > **Manage Placements**
2. **Create Placement**:
   - **Label**: ICNPAIM Dashboard
   - **Handle**: icnpaim-dashboard
   - **Type**: Course tool
   - **Tool Provider URL**: https://lti.icnpaim.cl/lti/launch
   - **Submit**

## Configuración del Servidor

### 1. Variables de Entorno

Crear archivo `.env` basado en `.env.example`:

```bash
# LTI 1.3 Configuration
LTI_ISSUER=https://tu-instancia.blackboard.com
LTI_CLIENT_ID=tu-application-id
LTI_DEPLOYMENT_ID=tu-deployment-id

# WordPress Integration  
WP_API_BASE=https://icnpaim.cl/wp-json/wp/v2
WORDPRESS_API_USER=tu-usuario-wp
WORDPRESS_API_PASSWORD=tu-application-password
```

### 2. WordPress Setup

1. **Instalar Application Passwords** (WordPress 5.6+)
2. **Crear usuario API** con permisos de editor
3. **Generar Application Password** para el usuario
4. **Añadir snippet PHP** del archivo `wp-grade-cpt.js` al `functions.php` del tema

### 3. Estructura de CPTs en WordPress

Los siguientes CPTs deben existir con `show_in_rest=true`:

- `student` - Estudiantes
- `course` - Cursos  
- `unit` - Unidades
- `progress` - Progreso
- `grade` - Notas (se crea con el snippet)

## Flujo de Integración

### 1. Launch desde Blackboard

```
Blackboard → OIDC Login → Node.js Tool → WordPress Upsert → React Dashboard
```

### 2. Sincronización de Datos

- **Al login**: Crear/actualizar Student y Course en WordPress
- **En tiempo real**: Progreso de cards se guarda en WordPress
- **Bajo demanda**: Notas se sincronizan desde LMS vía AGS

### 3. API Endpoints

- `GET /api/me` - Datos del usuario
- `GET /api/courses` - Cursos del usuario
- `GET /api/courses/:id/units` - Unidades y cards
- `GET /api/courses/:id/grades` - Notas del curso
- `GET /api/progress` - Progreso del usuario
- `POST /api/progress` - Actualizar progreso
- `POST /api/grades/refresh` - Sincronizar notas desde LMS

## Testing

### 1. Verificar Launch

```bash
# Verificar que el launch redirige a /dashboard
curl -I https://lti.icnpaim.cl/dashboard
```

### 2. Verificar API

```bash
# Obtener datos del usuario (requiere sesión LTI)
curl -X GET https://lti.icnpaim.cl/api/me \
  -H "Cookie: connect.sid=tu-session-id"

# Actualizar progreso
curl -X POST https://lti.icnpaim.cl/api/progress \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=tu-session-id" \
  -d '{"unitId": 123, "completedCardId": "card-1", "courseId": 456}'
```

### 3. Verificar WordPress

```bash
# Verificar CPT Grade
curl https://icnpaim.cl/wp-json/wp/v2/grade

# Verificar meta fields
curl https://icnpaim.cl/wp-json/wp/v2/student/123
```

## Troubleshooting

### Errores Comunes

1. **401 Unauthorized**: Verificar Application Password de WordPress
2. **CORS errors**: Verificar headers en WordPress
3. **Meta fields no aparecen**: Verificar que el snippet PHP esté activo
4. **AGS no funciona**: Verificar scopes y permisos en Blackboard

### Logs

```bash
# Ver logs del servidor
tail -f logs/lti-tool.log

# Ver logs de WordPress (si están habilitados)
tail -f wp-content/debug.log
```

## Estructura de Datos

### Student Meta
```json
{
  "_lms_sub": "00u8xyz...",
  "_email": "user@uni.tld", 
  "_full_name": "Nombre Apellido",
  "_course_ids": [123, 124]
}
```

### Unit Cards Meta
```json
{
  "_unit_cards": [
    {
      "id": "card-1",
      "title": "Video Introducción",
      "url": "https://youtube.com/watch?v=...",
      "tipoActividad": "video",
      "color": "#2dd4bf",
      "peso": 1,
      "estado": "pendiente"
    }
  ]
}
```

### Progress Meta
```json
{
  "_student_id": 345,
  "_course_id": 123, 
  "_unit_id": 567,
  "_completed_card_ids": ["card-1", "card-2"],
  "_percent": 50
}
```