<?php
if (!defined('ABSPATH')) exit;

/**
 * PAIM Learning Platform - LTI Integration Functions
 * Integración completa con Node.js LTI Tool
 * 
 * @package PAIM
 * @version 1.0.0
 */

// Activar logging para debug
if (!defined('WP_DEBUG')) {
    define('WP_DEBUG', true);
}
if (!defined('WP_DEBUG_LOG')) {
    define('WP_DEBUG_LOG', true);
}

// Habilitar logging para debug
function lti_log($message, $data = null) {
    $log_entry = date('Y-m-d H:i:s') . ' [LTI] ' . $message;
    if ($data) {
        $log_entry .= ' - Data: ' . json_encode($data, JSON_UNESCAPED_UNICODE);
    }
    error_log($log_entry);
}

// Log cuando se carga este archivo
lti_log("LTI functions loaded successfully");

// Register todos los CPTs necesarios
function lti_register_all_cpts() {
    lti_log("Registering all CPTs");
    
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
    
    lti_log("All CPTs registered successfully");
}
add_action('init', 'lti_register_all_cpts');

// Registrar meta fields para todos los CPTs (SIN underscore inicial)
function lti_register_meta_fields() {
    lti_log("Registering meta fields");
    
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
    register_meta('unit', 'course_id', array(
        'type' => 'integer',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'ID del curso'
    ));
    
    register_meta('unit', 'unit_cards', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'JSON de cards de la unidad'
    ));
    
    register_meta('unit', 'unit_settings', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'JSON de configuración de la unidad'
    ));

    // Meta fields para Progress
    register_meta('progress', 'student_id', array(
        'type' => 'integer',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'ID del estudiante'
    ));
    
    register_meta('progress', 'course_id', array(
        'type' => 'integer',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'ID del curso'
    ));
    
    register_meta('progress', 'unit_id', array(
        'type' => 'integer',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'ID de la unidad'
    ));
    
    register_meta('progress', 'completed_card_ids', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'JSON array de IDs de cards completadas'
    ));
    
    register_meta('progress', 'percent', array(
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
    
    lti_log("All meta fields registered successfully");
}
add_action('init', 'lti_register_meta_fields');

// Verificar que los CPTs están registrados
function lti_verify_cpts() {
    $cpts = ['student', 'course', 'unit', 'progress', 'grade'];
    $registered = [];
    $missing = [];
    
    foreach ($cpts as $cpt) {
        if (post_type_exists($cpt)) {
            $registered[] = $cpt;
        } else {
            $missing[] = $cpt;
        }
    }
    
    lti_log("CPT Status Check", array(
        'registered' => $registered,
        'missing' => $missing,
        'total_expected' => count($cpts)
    ));
}
add_action('wp_loaded', 'lti_verify_cpts');

// Asegurar que los meta fields se muestren en REST
function lti_ensure_meta_in_rest($response, $post, $request) {
    $post_type = $post->post_type;
    
    if (in_array($post_type, array('student', 'course', 'unit', 'progress', 'grade'))) {
        $meta = get_post_meta($post->ID);
        $response->data['meta'] = array();
        
        foreach ($meta as $key => $value) {
            // Solo incluir meta fields que no empiecen con _
            if (substr($key, 0, 1) !== '_') {
                $response->data['meta'][$key] = is_array($value) && count($value) === 1 ? $value[0] : $value;
            }
        }
    }
    
    return $response;
}
add_filter('rest_prepare_student_response', 'lti_ensure_meta_in_rest', 10, 3);
add_filter('rest_prepare_course_response', 'lti_ensure_meta_in_rest', 10, 3);
add_filter('rest_prepare_unit_response', 'lti_ensure_meta_in_rest', 10, 3);
add_filter('rest_prepare_progress_response', 'lti_ensure_meta_in_rest', 10, 3);
add_filter('rest_prepare_grade_response', 'lti_ensure_meta_in_rest', 10, 3);

// Metabox para Unit Cards
function lti_add_unit_metaboxes() {
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
}
add_action('add_meta_boxes', 'lti_add_unit_metaboxes');

function lti_unit_course_metabox_callback($post) {
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

function lti_unit_cards_metabox_callback($post) {
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

function lti_save_unit_metaboxes($post_id) {
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
}
add_action('save_post', 'lti_save_unit_metaboxes');

// Endpoints REST personalizados con logging detallado
function lti_register_debug_endpoints() {
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
    
    register_rest_route('lti/v1', '/ping', array(
        'methods' => 'GET',
        'callback' => 'lti_ping_endpoint',
        'permission_callback' => '__return_true'
    ));
}
add_action('rest_api_init', 'lti_register_debug_endpoints');

function lti_ping_endpoint() {
    return array(
        'status' => 'ok',
        'timestamp' => current_time('mysql'),
        'wordpress_version' => get_bloginfo('version'),
        'cpts_registered' => array('student', 'course', 'unit', 'progress', 'grade'),
        'rest_url' => rest_url('wp/v2/'),
        'site_url' => get_site_url(),
        'admin_email' => get_option('admin_email'),
        'debug_endpoints' => array(
            'ping' => rest_url('lti/v1/ping'),
            'debug_student' => rest_url('lti/v1/debug/student/{sub}'),
            'debug_course' => rest_url('lti/v1/debug/course/{context_id}')
        )
    );
}

function lti_debug_student_endpoint($request) {
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
        'linked_courses' => array_map(function($course_id) {
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

function lti_debug_course_endpoint($request) {
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
        'units' => array_map(function($unit) {
            $cards_json = get_post_meta($unit->ID, 'unit_cards', true);
            return array(
                'id' => $unit->ID,
                'title' => $unit->post_title,
                'cards' => $cards_json ? json_decode($cards_json, true) : array()
            );
        }, $units),
        'linked_students' => array_map(function($student_id) {
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

// Crear unidades de ejemplo para un curso nuevo
function lti_create_sample_units($course_id) {
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
function lti_log_all_rest_requests($response, $handler, $request) {
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
function lti_create_sample_data() {
    // Los datos se crean automáticamente cuando llega el LTI launch
    // No crear datos de ejemplo estáticos
    lti_log("Theme activated - waiting for LTI launch to create real data");
}
add_action('after_switch_theme', 'lti_create_sample_data');

?>