<?php
if (!defined('ABSPATH')) exit;

/**
 * PAIM Learning Platform - LTI Integration Functions
 * Integración completa con Node.js LTI Tool
 * 
 * @package PAIM
 * @version 1.0.0
 */

// Habilitar logging para debug
function lti_log($message, $data = null)
{
    $log_entry = date('Y-m-d H:i:s') . ' [LTI] ' . $message;
    if ($data) {
        $log_entry .= ' - Data: ' . json_encode($data, JSON_UNESCAPED_UNICODE);
    }
    error_log($log_entry);
}

// Register todos los CPTs necesarios
function lti_register_all_cpts()
{

    // Student CPT
    register_post_type('student', array(
        'labels' => array(
            'name' => 'Estudiantes',
            'singular_name' => 'Estudiante',
            'add_new' => 'Agregar Estudiante',
            'add_new_item' => 'Agregar Nuevo Estudiante',
            'edit_item' => 'Editar Estudiante',
            'new_item' => 'Nuevo Estudiante',
            'view_item' => 'Ver Estudiante',
            'search_items' => 'Buscar Estudiantes',
            'not_found' => 'No se encontraron estudiantes',
            'not_found_in_trash' => 'No hay estudiantes en la papelera'
        ),
        'public' => false,
        'show_ui' => true,
        'show_in_menu' => true,
        'show_in_rest' => true,
        'rest_base' => 'student',
        'capability_type' => 'post',
        'hierarchical' => false,
        'rewrite' => array('slug' => 'student'),
        'supports' => array('title', 'custom-fields'),
        'menu_icon' => 'dashicons-groups',
        'menu_position' => 20
    ));

    // Course CPT
    register_post_type('course', array(
        'labels' => array(
            'name' => 'Cursos',
            'singular_name' => 'Curso',
            'add_new' => 'Agregar Curso',
            'add_new_item' => 'Agregar Nuevo Curso',
            'edit_item' => 'Editar Curso',
            'new_item' => 'Nuevo Curso',
            'view_item' => 'Ver Curso',
            'search_items' => 'Buscar Cursos',
            'not_found' => 'No se encontraron cursos',
            'not_found_in_trash' => 'No hay cursos en la papelera'
        ),
        'public' => false,
        'show_ui' => true,
        'show_in_menu' => true,
        'show_in_rest' => true,
        'rest_base' => 'course',
        'capability_type' => 'post',
        'hierarchical' => false,
        'rewrite' => array('slug' => 'course'),
        'supports' => array('title', 'editor', 'custom-fields'),
        'menu_icon' => 'dashicons-book',
        'menu_position' => 21
    ));

    // Unit CPT
    register_post_type('unit', array(
        'labels' => array(
            'name' => 'Unidades',
            'singular_name' => 'Unidad',
            'add_new' => 'Agregar Unidad',
            'add_new_item' => 'Agregar Nueva Unidad',
            'edit_item' => 'Editar Unidad',
            'new_item' => 'Nueva Unidad',
            'view_item' => 'Ver Unidad',
            'search_items' => 'Buscar Unidades',
            'not_found' => 'No se encontraron unidades',
            'not_found_in_trash' => 'No hay unidades en la papelera'
        ),
        'public' => false,
        'show_ui' => true,
        'show_in_menu' => true,
        'show_in_rest' => true,
        'rest_base' => 'unit',
        'capability_type' => 'post',
        'hierarchical' => false,
        'rewrite' => array('slug' => 'unit'),
        'supports' => array('title', 'editor', 'custom-fields'),
        'menu_icon' => 'dashicons-list-view',
        'menu_position' => 22
    ));

    // Progress CPT
    register_post_type('progress', array(
        'labels' => array(
            'name' => 'Progreso',
            'singular_name' => 'Progreso',
            'add_new' => 'Agregar Progreso',
            'add_new_item' => 'Agregar Nuevo Progreso',
            'edit_item' => 'Editar Progreso',
            'new_item' => 'Nuevo Progreso',
            'view_item' => 'Ver Progreso',
            'search_items' => 'Buscar Progreso',
            'not_found' => 'No se encontró progreso',
            'not_found_in_trash' => 'No hay progreso en la papelera'
        ),
        'public' => false,
        'show_ui' => true,
        'show_in_menu' => true,
        'show_in_rest' => true,
        'rest_base' => 'progress',
        'capability_type' => 'post',
        'hierarchical' => false,
        'rewrite' => array('slug' => 'progress'),
        'supports' => array('title', 'custom-fields'),
        'menu_icon' => 'dashicons-chart-line',
        'menu_position' => 23
    ));

    // Grade CPT
    register_post_type('grade', array(
        'labels' => array(
            'name' => 'Notas',
            'singular_name' => 'Nota',
            'add_new' => 'Agregar Nota',
            'add_new_item' => 'Agregar Nueva Nota',
            'edit_item' => 'Editar Nota',
            'new_item' => 'Nueva Nota',
            'view_item' => 'Ver Nota',
            'search_items' => 'Buscar Notas',
            'not_found' => 'No se encontraron notas',
            'not_found_in_trash' => 'No hay notas en la papelera'
        ),
        'public' => false,
        'show_ui' => true,
        'show_in_menu' => true,
        'show_in_rest' => true,
        'rest_base' => 'grade',
        'capability_type' => 'post',
        'hierarchical' => false,
        'rewrite' => array('slug' => 'grade'),
        'supports' => array('title', 'custom-fields'),
        'menu_icon' => 'dashicons-welcome-learn-more',
        'menu_position' => 24
    ));
}
add_action('init', 'lti_register_all_cpts');

// Registrar meta fields para todos los CPTs (SIN underscore inicial)
function lti_register_meta_fields()
{
    // Meta fields para Student
    register_meta('student', 'lms_sub', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'LMS Subject ID'
    ));

    register_meta('student', 'email', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'Email del estudiante'
    ));

    register_meta('student', 'full_name', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'Nombre completo'
    ));

    register_meta('student', 'course_ids', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'JSON array de IDs de cursos vinculados'
    ));

    // Meta fields para Course
    register_meta('course', 'lms_context_id', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'LMS Context ID'
    ));

    register_meta('course', 'lms_context_label', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'LMS Context Label'
    ));

    register_meta('course', 'lms_context_title', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'LMS Context Title'
    ));

    register_meta('course', 'student_ids', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'JSON array de IDs de estudiantes vinculados'
    ));

    // Meta fields para Unit
    register_post_meta('unit', 'course_id', array(
        'type' => 'integer',
        'single' => true,
        'show_in_rest' => array(
            'schema' => array(
                'type' => 'integer',
                'description' => 'ID del curso'
            )
        ),
        'description' => 'ID del curso'
    ));

    register_post_meta('unit', 'unit_cards', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'JSON de cards de la unidad'
    ));

    register_post_meta('unit', 'unit_settings', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'JSON de configuración de la unidad'
    ));

    register_post_meta('unit', 'content_id', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'ID del Contenido (evaluacion) en BlackBoard que determina la ruta de aprendizaje'
    ));

    register_post_meta('unit', 'cards_blocked', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'Indicador de bloqueo de cards'
    ));

    // Meta fields para Progress
    register_post_meta('progress', 'student_id', array(
        'type' => 'integer',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'ID del estudiante'
    ));

    register_post_meta('progress', 'course_id', array(
        'type' => 'integer',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'ID del curso'
    ));

    register_post_meta('progress', 'unit_id', array(
        'type' => 'integer',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'ID de la unidad'
    ));

    register_post_meta('progress', 'completed_card_ids', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'JSON array de IDs de cards completadas'
    ));

    register_post_meta('progress', 'percent', array(
        'type' => 'integer',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'Porcentaje de progreso (0-100)'
    ));

    // Meta fields para Grade
    register_meta('grade', 'student_id', array(
        'type' => 'integer',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'ID del estudiante'
    ));

    register_meta('grade', 'course_id', array(
        'type' => 'integer',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'ID del curso'
    ));

    register_meta('grade', 'lineitem_id', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'LTI Line Item ID'
    ));

    register_meta('grade', 'score_given', array(
        'type' => 'number',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'Puntuación obtenida'
    ));

    register_meta('grade', 'score_maximum', array(
        'type' => 'number',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'Puntuación máxima'
    ));

    register_meta('grade', 'activity_title', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'Título de la actividad'
    ));

    register_meta('grade', 'attempt_id', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'ID del intento'
    ));

    register_meta('grade', 'timestamp', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'Timestamp ISO8601'
    ));

    register_meta('grade', 'provenance', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'Origen: lms|app'
    ));
}
add_action('init', 'lti_register_meta_fields');

// Asegurar que los meta fields se muestren en REST
function lti_ensure_meta_in_rest($response, $post, $request)
{
    $post_type = $post->post_type;

    if (in_array($post_type, array('student', 'course', 'unit', 'progress', 'grade'))) {
        $meta = get_post_meta($post->ID);
        $response->data['meta'] = array();

        foreach ($meta as $key => $value) {
            // Solo incluir meta fields que no empiecen con _
            // if (substr($key, 0, 1) !== '_') {
            $response->data['meta'][$key] = is_array($value) && count($value) === 1 ? $value[0] : $value;
            // }
        }
    }

    return $response;
}

add_filter('rest_prepare_student', 'lti_ensure_meta_in_rest', 10, 3);
add_filter('rest_prepare_course', 'lti_ensure_meta_in_rest', 10, 3);
add_filter('rest_prepare_unit', 'lti_ensure_meta_in_rest', 10, 3);
add_filter('rest_prepare_progress', 'lti_ensure_meta_in_rest', 10, 3);
add_filter('rest_prepare_grade', 'lti_ensure_meta_in_rest', 10, 3);

// Metabox para Unit Cards
function lti_add_unit_metaboxes()
{
    add_meta_box(
        'unit_cards_metabox',
        'Cards de la Unidad',
        'lti_unit_cards_metabox_callback',
        'unit',
        'normal',
        'high'
    );

    add_meta_box(
        'unit_course_metabox',
        'Configuración del Curso',
        'lti_unit_course_metabox_callback',
        'unit',
        'side',
        'default'
    );

    add_meta_box(
        'unit_content_metabox',
        'Contenido en Blackboard',
        'lti_unit_content_metabox_callback',
        'unit',
        'side',
        'default'
    );
    add_meta_box(
        'unit_cards_blocked_metabox',
        'Bloqueo de Avance',
        'lti_unit_cards_blocked_metabox_callback',
        'unit',
        'side',
        'default'
    );
}
add_action('add_meta_boxes', 'lti_add_unit_metaboxes');

function lti_unit_course_metabox_callback($post)
{
    wp_nonce_field('unit_course_nonce', 'unit_course_nonce');

    $course_id = get_post_meta($post->ID, 'course_id', true);

    // Obtener todos los cursos
    $courses = get_posts(array(
        'post_type' => 'course',
        'posts_per_page' => -1,
        'post_status' => 'publish'
    ));

    echo '<p><label for="course_id"><strong>Curso:</strong></label></p>';
    echo '<select name="course_id" id="course_id" style="width:100%">';
    echo '<option value="">Seleccionar curso...</option>';
    foreach ($courses as $course) {
        $selected = ($course_id == $course->ID) ? 'selected' : '';
        echo '<option value="' . $course->ID . '" ' . $selected . '>' . esc_html($course->post_title) . '</option>';
    }
    echo '</select>';
}

function lti_unit_cards_metabox_callback($post)
{
    wp_nonce_field('unit_cards_nonce', 'unit_cards_nonce');

    $cards = get_post_meta($post->ID, 'unit_cards', true);
    $cards = $cards ? json_decode($cards, true) : array();

    echo '<div id="unit-cards-editor">';
    echo '<p><strong>Cards JSON:</strong></p>';
    echo '<textarea name="unit_cards" rows="15" style="width:100%; font-family:monospace">' . esc_textarea(json_encode($cards, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) . '</textarea>';
    echo '<p><em>Formato esperado por React:</em></p>';
    echo '<pre style="background:#f0f0f0; padding:10px; font-size:12px">[
  {
    "id": "card-1",
    "title": "Video Introducción",
    "url": "https://youtube.com/watch?v=...",
    "tipoActividad": "video",
    "color": "#2dd4bf",
    "peso": 1,
    "estado": "pendiente"
  },
  {
    "id": "card-2", 
    "title": "Quiz Tema 1",
    "url": "https://forms.gle/...",
    "tipoActividad": "quiz",
    "color": "#f59e0b",
    "peso": 2,
    "estado": "pendiente"
  }
]</pre>';
    echo '</div>';
}

function lti_unit_content_metabox_callback($post)
{
    wp_nonce_field('unit_content_nonce', 'unit_content_nonce');

    $content_id = get_post_meta($post->ID, 'content_id', true);


    echo '<div id="unit-content-id-editor">';
    echo '<p><strong>content_id de evaluacion:</strong></p>';
    echo '<textarea name="content_id" rows="1" style="width:100%; font-family:monospace">' . esc_textarea($content_id) . '</textarea>';
    echo '</div>';
}

function lti_unit_cards_blocked_metabox_callback($post)
{
    wp_nonce_field('unit_cards_blocked_nonce', 'unit_cards_blocked_nonce');

    $cards_blocked = get_post_meta($post->ID, 'cards_blocked', true);

    // Obtener todos los cursos
    $courses = get_posts(array(
        'post_type' => 'course',
        'posts_per_page' => -1,
        'post_status' => 'publish'
    ));
    if ($cards_blocked == 'true') {
        $yesOption = 'selected';
        $noOption = '';
    } else {
        $yesOption = '';
        $noOption = 'selected';
    }
    echo '<p><label for="cards_blocked"><strong>Bloquear Cards:</strong></label></p>';
    echo '<select name="cards_blocked" id="cards_blocked" style="width:100%">';
    echo '<option value="true" ' . $yesOption .  '>Bloquear segun avance</option>';
    echo '<option value="false" ' . $noOption .  '>Permitir libre acceso</option>';
    echo '</select>';
}

function lti_save_unit_metaboxes($post_id)
{
    // Verificar nonces
    if (isset($_POST['unit_course_nonce']) && wp_verify_nonce($_POST['unit_course_nonce'], 'unit_course_nonce')) {
        if (isset($_POST['course_id'])) {
            update_post_meta($post_id, 'course_id', intval($_POST['course_id']));
        }
    }

    if (isset($_POST['unit_cards_nonce']) && wp_verify_nonce($_POST['unit_cards_nonce'], 'unit_cards_nonce')) {
        if (isset($_POST['unit_cards'])) {
            $cards = json_decode(stripslashes($_POST['unit_cards']), true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($cards)) {
                update_post_meta($post_id, 'unit_cards', json_encode($cards, JSON_UNESCAPED_UNICODE));
            }
        }
    }
    if (isset($_POST['unit_content_nonce']) && wp_verify_nonce($_POST['unit_content_nonce'], 'unit_content_nonce')) {
        if (isset($_POST['content_id'])) {
            update_post_meta($post_id, 'content_id', $_POST['content_id']);
        }
    }
    if (isset($_POST['unit_cards_blocked_nonce']) && wp_verify_nonce($_POST['unit_cards_blocked_nonce'], 'unit_cards_blocked_nonce')) {
        if (isset($_POST['cards_blocked'])) {
            update_post_meta($post_id, 'cards_blocked', $_POST['cards_blocked']);
        }
    }
}
add_action('save_post', 'lti_save_unit_metaboxes');



// Endpoints REST personalizados con logging detallado
function lti_register_debug_endpoints()
{
    register_rest_route('lti/v1', '/debug/student/(?P<sub>[a-zA-Z0-9\-_]+)', array(
        'methods' => 'GET',
        'callback' => 'lti_debug_student_endpoint',
        'permission_callback' => '__return_true'
    ));

    register_rest_route('lti/v1', '/debug/course/(?P<context_id>[a-zA-Z0-9\-_]+)', array(
        'methods' => 'GET',
        'callback' => 'lti_debug_course_endpoint',
        'permission_callback' => '__return_true'
    ));

    register_rest_route('lti/v1', '/debug/communication', array(
        'methods' => 'POST',
        'callback' => 'lti_debug_communication_endpoint',
        'permission_callback' => '__return_true'
    ));

    register_rest_route('lti/v1', '/sync/student', array(
        'methods' => 'POST',
        'callback' => 'lti_sync_student_endpoint',
        'permission_callback' => '__return_true'
    ));

    register_rest_route('lti/v1', '/sync/course', array(
        'methods' => 'POST',
        'callback' => 'lti_sync_course_endpoint',
        'permission_callback' => '__return_true'
    ));

    register_rest_route('lti/v1', '/ping', array(
        'methods' => 'GET',
        'callback' => 'lti_ping_endpoint',
        'permission_callback' => '__return_true'
    ));
}
add_action('rest_api_init', 'lti_register_debug_endpoints');

function lti_ping_endpoint()
{
    return array(
        'status' => 'ok',
        'timestamp' => current_time('mysql'),
        'wordpress_version' => get_bloginfo('version'),
        'cpts_registered' => array('student', 'course', 'unit', 'progress', 'grade'),
        'rest_url' => rest_url('wp/v2/'),
        'debug_endpoints' => array(
            'ping' => rest_url('lti/v1/ping'),
            'debug_student' => rest_url('lti/v1/debug/student/{sub}'),
            'debug_course' => rest_url('lti/v1/debug/course/{context_id}'),
            'sync_student' => rest_url('lti/v1/sync/student'),
            'sync_course' => rest_url('lti/v1/sync/course')
        )
    );
}

function lti_debug_student_endpoint($request)
{
    $sub = $request['sub'];
    lti_log("Debug Student Request", array('sub' => $sub));

    $students = get_posts(array(
        'post_type' => 'student',
        'meta_key' => 'lms_sub',
        'meta_value' => $sub,
        'posts_per_page' => 1
    ));

    if (empty($students)) {
        lti_log("Student not found", array('sub' => $sub));
        return new WP_Error('student_not_found', "No student found with lms_sub: {$sub}", array('status' => 404));
    }

    $student = $students[0];
    $course_ids_json = get_post_meta($student->ID, 'course_ids', true);
    $course_ids = $course_ids_json ? json_decode($course_ids_json, true) : array();

    $result = array(
        'student' => array(
            'id' => $student->ID,
            'title' => $student->post_title,
            'lms_sub' => get_post_meta($student->ID, 'lms_sub', true),
            'email' => get_post_meta($student->ID, 'email', true),
            'course_ids' => $course_ids
        ),
        'linked_courses' => array_map(function ($course_id) {
            $course = get_post($course_id);
            return $course ? array(
                'id' => $course->ID,
                'title' => $course->post_title,
                'lms_context_id' => get_post_meta($course->ID, 'lms_context_id', true)
            ) : null;
        }, $course_ids)
    );

    lti_log("Debug Student Response", $result);
    return $result;
}

function lti_debug_course_endpoint($request)
{
    $context_id = $request['context_id'];
    lti_log("Debug Course Request", array('context_id' => $context_id));

    $courses = get_posts(array(
        'post_type' => 'course',
        'meta_key' => 'lms_context_id',
        'meta_value' => $context_id,
        'posts_per_page' => 1
    ));

    if (empty($courses)) {
        lti_log("Course not found", array('context_id' => $context_id));
        return new WP_Error('course_not_found', "No course found with lms_context_id: {$context_id}", array('status' => 404));
    }

    $course = $courses[0];
    $student_ids_json = get_post_meta($course->ID, 'student_ids', true);
    $student_ids = $student_ids_json ? json_decode($student_ids_json, true) : array();

    // Obtener unidades
    $units = get_posts(array(
        'post_type' => 'unit',
        'meta_key' => 'course_id',
        'meta_value' => $course->ID,
        'posts_per_page' => -1
    ));

    $result = array(
        'course' => array(
            'id' => $course->ID,
            'title' => $course->post_title,
            'lms_context_id' => get_post_meta($course->ID, 'lms_context_id', true),
            'student_ids' => $student_ids
        ),
        'units' => array_map(function ($unit) {
            $cards_json = get_post_meta($unit->ID, 'unit_cards', true);
            return array(
                'id' => $unit->ID,
                'title' => $unit->post_title,
                'cards' => $cards_json ? json_decode($cards_json, true) : array()
            );
        }, $units),
        'linked_students' => array_map(function ($student_id) {
            $student = get_post($student_id);
            return $student ? array(
                'id' => $student->ID,
                'title' => $student->post_title,
                'lms_sub' => get_post_meta($student->ID, 'lms_sub', true)
            ) : null;
        }, $student_ids)
    );

    lti_log("Debug Course Response", $result);
    return $result;
}

function lti_debug_communication_endpoint($request)
{
    $params = $request->get_json_params();
    $headers = $request->get_headers();

    lti_log("LTI Communication Debug", array(
        'source' => 'lti.icnpaim.cl',
        'target' => 'icnpaim.cl',
        'method' => $request->get_method(),
        'params' => $params,
        'headers' => $headers,
        'user_agent' => isset($headers['user_agent']) ? $headers['user_agent'][0] : 'unknown',
        'timestamp' => current_time('mysql')
    ));

    return array(
        'status' => 'communication_logged',
        'timestamp' => current_time('mysql'),
        'received_data' => $params,
        'wordpress_version' => get_bloginfo('version'),
        'php_version' => PHP_VERSION
    );
}

// Endpoint para sincronizar estudiante desde LTI
function lti_sync_student_endpoint($request)
{
    $params = $request->get_json_params();
    lti_log("Sync Student Request", $params);

    if (!isset($params['sub']) || !isset($params['name'])) {
        return new WP_Error('missing_params', 'Missing required parameters: sub, name', array('status' => 400));
    }

    $sub = sanitize_text_field($params['sub']);
    $name = sanitize_text_field($params['name']);
    $email = isset($params['email']) ? sanitize_email($params['email']) : '';

    // Buscar estudiante existente
    $existing_students = get_posts(array(
        'post_type' => 'student',
        'meta_key' => 'lms_sub',
        'meta_value' => $sub,
        'posts_per_page' => 1
    ));

    if (!empty($existing_students)) {
        // Actualizar existente
        $student_id = $existing_students[0]->ID;
        wp_update_post(array(
            'ID' => $student_id,
            'post_title' => $name
        ));

        update_post_meta($student_id, 'email', $email);
        update_post_meta($student_id, 'full_name', $name);

        lti_log("Student Updated", array('id' => $student_id, 'sub' => $sub));
        return array('id' => $student_id, 'action' => 'updated');
    } else {
        // Crear nuevo
        $student_id = wp_insert_post(array(
            'post_title' => $name,
            'post_type' => 'student',
            'post_status' => 'publish'
        ));

        if ($student_id) {
            update_post_meta($student_id, 'lms_sub', $sub);
            update_post_meta($student_id, 'email', $email);
            update_post_meta($student_id, 'full_name', $name);
            update_post_meta($student_id, 'course_ids', json_encode(array()));

            lti_log("Student Created", array('id' => $student_id, 'sub' => $sub));
            return array('id' => $student_id, 'action' => 'created');
        }
    }

    return new WP_Error('creation_failed', 'Failed to create student', array('status' => 500));
}

// Endpoint para sincronizar curso desde LTI
function lti_sync_course_endpoint($request)
{
    $params = $request->get_json_params();
    lti_log("Sync Course Request", $params);

    if (!isset($params['contextId']) || !isset($params['title'])) {
        return new WP_Error('missing_params', 'Missing required parameters: contextId, title', array('status' => 400));
    }

    $context_id = sanitize_text_field($params['contextId']);
    $title = sanitize_text_field($params['title']);
    $label = isset($params['label']) ? sanitize_text_field($params['label']) : '';

    // Buscar curso existente
    $existing_courses = get_posts(array(
        'post_type' => 'course',
        'meta_key' => 'lms_context_id',
        'meta_value' => $context_id,
        'posts_per_page' => 1
    ));

    if (!empty($existing_courses)) {
        // Actualizar existente
        $course_id = $existing_courses[0]->ID;
        wp_update_post(array(
            'ID' => $course_id,
            'post_title' => $title
        ));

        update_post_meta($course_id, 'lms_context_label', $label);
        update_post_meta($course_id, 'lms_context_title', $title);

        lti_log("Course Updated", array('id' => $course_id, 'context_id' => $context_id));
        return array('id' => $course_id, 'action' => 'updated');
    } else {
        // Crear nuevo
        $course_id = wp_insert_post(array(
            'post_title' => $title,
            'post_type' => 'course',
            'post_status' => 'publish'
        ));

        if ($course_id) {
            update_post_meta($course_id, 'lms_context_id', $context_id);
            update_post_meta($course_id, 'lms_context_label', $label);
            update_post_meta($course_id, 'lms_context_title', $title);
            update_post_meta($course_id, 'student_ids', json_encode(array()));

            // Crear unidades de ejemplo para el curso
            lti_create_sample_units($course_id);

            lti_log("Course Created", array('id' => $course_id, 'context_id' => $context_id));
            return array('id' => $course_id, 'action' => 'created');
        }
    }

    return new WP_Error('creation_failed', 'Failed to create course', array('status' => 500));
}

// Crear unidades de ejemplo para un curso nuevo
function lti_create_sample_units($course_id)
{
    $sample_units = array(
        array(
            'title' => 'Unidad 1: Introducción',
            'cards' => array(
                array(
                    'id' => 'card-1-1',
                    'title' => 'Video: Bienvenida al curso',
                    'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    'tipoActividad' => 'video',
                    'color' => '#e53e3e',
                    'peso' => 1,
                    'estado' => 'pendiente'
                ),
                array(
                    'id' => 'card-1-2',
                    'title' => 'Lectura: Conceptos básicos',
                    'url' => 'https://example.com/lectura1',
                    'tipoActividad' => 'lectura',
                    'color' => '#3182ce',
                    'peso' => 2,
                    'estado' => 'pendiente'
                ),
                array(
                    'id' => 'card-1-3',
                    'title' => 'Quiz: Evaluación inicial',
                    'url' => 'https://forms.gle/example1',
                    'tipoActividad' => 'quiz',
                    'color' => '#d69e2e',
                    'peso' => 3,
                    'estado' => 'pendiente'
                )
            )
        ),
        array(
            'title' => 'Unidad 2: Desarrollo',
            'cards' => array(
                array(
                    'id' => 'card-2-1',
                    'title' => 'Video: Conceptos avanzados',
                    'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    'tipoActividad' => 'video',
                    'color' => '#e53e3e',
                    'peso' => 1,
                    'estado' => 'pendiente'
                ),
                array(
                    'id' => 'card-2-2',
                    'title' => 'Recurso: Documentación',
                    'url' => 'https://example.com/docs',
                    'tipoActividad' => 'recurso',
                    'color' => '#38a169',
                    'peso' => 2,
                    'estado' => 'pendiente'
                )
            )
        )
    );

    foreach ($sample_units as $index => $unit_data) {
        $unit_id = wp_insert_post(array(
            'post_title' => $unit_data['title'],
            'post_type' => 'unit',
            'post_status' => 'publish'
        ));

        if ($unit_id) {
            update_post_meta($unit_id, 'course_id', $course_id);
            update_post_meta($unit_id, 'unit_cards', json_encode($unit_data['cards'], JSON_UNESCAPED_UNICODE));
            lti_log("Sample Unit Created", array('unit_id' => $unit_id, 'course_id' => $course_id));
        }
    }
}

// Hook para interceptar todas las llamadas REST API y loggearlas
function lti_log_all_rest_requests($response, $handler, $request)
{
    $route = $request->get_route();

    // Solo loggear rutas relacionadas con nuestros CPTs o LTI
    if (preg_match('/\/(student|course|unit|progress|grade|lti)/', $route)) {
        lti_log("REST API Call", array(
            'route' => $route,
            'method' => $request->get_method(),
            'params' => $request->get_params(),
            'body' => $request->get_json_params(),
            'response_status' => is_wp_error($response) ? 'error' : 'success',
            'user_agent' => $request->get_header('user_agent')
        ));
    }

    return $response;
}
add_filter('rest_request_after_callbacks', 'lti_log_all_rest_requests', 10, 3);

// Crear datos de ejemplo al activar el tema (solo una vez)
function lti_create_sample_data()
{
    // Los datos se crean automáticamente cuando llega el LTI launch
    // No crear datos de ejemplo estáticos
    lti_log("Theme activated - waiting for LTI launch to create real data");
}
add_action('after_switch_theme', 'lti_create_sample_data');


// Enqueue scripts and styles
add_action('wp_enqueue_scripts', 'paim_enqueue_scripts');
function paim_enqueue_scripts()
{
    wp_enqueue_style('bootstrap-css', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');
    wp_enqueue_script('bootstrap-js', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js', [], null, true);
}

require_once get_template_directory() . '/class-wp-bootstrap-navwalker.php';

/**
 * ICN PAIM functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package ICN_PAIM
 */

if (! defined('_S_VERSION')) {
    // Replace the version number of the theme on each release.
    define('_S_VERSION', '1.0.0');
}

/**
 * Sets up theme defaults and registers support for various WordPress features.
 *
 * Note that this function is hooked into the after_setup_theme hook, which
 * runs before the init hook. The init hook is too late for some features, such
 * as indicating support for post thumbnails.
 */
function icn_setup()
{
    /*
		* Make theme available for translation.
		* Translations can be filed in the /languages/ directory.
		* If you're building a theme based on ICN PAIM, use a find and replace
		* to change 'icn' to the name of your theme in all the template files.
		*/
    load_theme_textdomain('icn', get_template_directory() . '/languages');

    // Add default posts and comments RSS feed links to head.
    add_theme_support('automatic-feed-links');

    /*
		* Let WordPress manage the document title.
		* By adding theme support, we declare that this theme does not use a
		* hard-coded <title> tag in the document head, and expect WordPress to
		* provide it for us.
		*/
    add_theme_support('title-tag');

    /*
		* Enable support for Post Thumbnails on posts and pages.
		*
		* @link https://developer.wordpress.org/themes/functionality/featured-images-post-thumbnails/
		*/
    add_theme_support('post-thumbnails');

    // This theme uses wp_nav_menu() in one location.
    register_nav_menus(
        array(
            'menu-1' => esc_html__('Primary', 'icn'),
        )
    );

    /*
		* Switch default core markup for search form, comment form, and comments
		* to output valid HTML5.
		*/
    add_theme_support(
        'html5',
        array(
            'search-form',
            'comment-form',
            'comment-list',
            'gallery',
            'caption',
            'style',
            'script',
        )
    );

    // Set up the WordPress core custom background feature.
    add_theme_support(
        'custom-background',
        apply_filters(
            'icn_custom_background_args',
            array(
                'default-color' => 'ffffff',
                'default-image' => '',
            )
        )
    );

    // Add theme support for selective refresh for widgets.
    add_theme_support('customize-selective-refresh-widgets');

    /**
     * Add support for core custom logo.
     *
     * @link https://codex.wordpress.org/Theme_Logo
     */
    add_theme_support(
        'custom-logo',
        array(
            'height'      => 250,
            'width'       => 250,
            'flex-width'  => true,
            'flex-height' => true,
        )
    );
}
add_action('after_setup_theme', 'icn_setup');

/**
 * Set the content width in pixels, based on the theme's design and stylesheet.
 *
 * Priority 0 to make it available to lower priority callbacks.
 *
 * @global int $content_width
 */
function icn_content_width()
{
    $GLOBALS['content_width'] = apply_filters('icn_content_width', 640);
}
add_action('after_setup_theme', 'icn_content_width', 0);

/**
 * Register widget area.
 *
 * @link https://developer.wordpress.org/themes/functionality/sidebars/#registering-a-sidebar
 */
function icn_widgets_init()
{
    register_sidebar(
        array(
            'name'          => esc_html__('Sidebar', 'icn'),
            'id'            => 'sidebar-1',
            'description'   => esc_html__('Add widgets here.', 'icn'),
            'before_widget' => '<section id="%1$s" class="widget %2$s">',
            'after_widget'  => '</section>',
            'before_title'  => '<h2 class="widget-title">',
            'after_title'   => '</h2>',
        )
    );
}
add_action('widgets_init', 'icn_widgets_init');

/**
 * Enqueue scripts and styles.
 */
function icn_scripts()
{
    wp_enqueue_style('icn-style', get_stylesheet_uri(), array(), _S_VERSION);
    wp_style_add_data('icn-style', 'rtl', 'replace');

    wp_enqueue_script('icn-navigation', get_template_directory_uri() . '/js/navigation.js', array(), _S_VERSION, true);

    if (is_singular() && comments_open() && get_option('thread_comments')) {
        wp_enqueue_script('comment-reply');
    }
}
add_action('wp_enqueue_scripts', 'icn_scripts');

/**
 * Implement the Custom Header feature.
 */
require get_template_directory() . '/inc/custom-header.php';

/**
 * Custom template tags for this theme.
 */
require get_template_directory() . '/inc/template-tags.php';

/**
 * Functions which enhance the theme by hooking into WordPress.
 */
require get_template_directory() . '/inc/template-functions.php';

/**
 * Customizer additions.
 */
require get_template_directory() . '/inc/customizer.php';

/**
 * Load Jetpack compatibility file.
 */
if (defined('JETPACK__VERSION')) {
    require get_template_directory() . '/inc/jetpack.php';
}
