<?php
if (!defined('ABSPATH')) exit;

/**
 * PAIM Learning Platform - LTI Integration Functions
 * Integración completa con Node.js LTI Tool
 * 
 * @package PAIM
 * @version 1.0.0
 */

// Register CPT Grade (el que faltaba)
function lti_register_grade_cpt() {
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
add_action('init', 'lti_register_grade_cpt');

// Registrar meta fields para todos los CPTs (SIN underscore inicial)
function lti_register_meta_fields() {
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
}
add_action('init', 'lti_register_meta_fields');

// Metabox para Unit Cards (mejorado)
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
    if (!isset($_POST['unit_course_nonce']) || !wp_verify_nonce($_POST['unit_course_nonce'], 'unit_course_nonce')) {
        return;
    }
    
    if (!isset($_POST['unit_cards_nonce']) || !wp_verify_nonce($_POST['unit_cards_nonce'], 'unit_cards_nonce')) {
        return;
    }

    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }

    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    // Guardar course_id
    if (isset($_POST['course_id'])) {
        update_post_meta($post_id, 'course_id', intval($_POST['course_id']));
    }

    // Guardar cards
    if (isset($_POST['unit_cards'])) {
        $cards = json_decode(stripslashes($_POST['unit_cards']), true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($cards)) {
            update_post_meta($post_id, 'unit_cards', json_encode($cards, JSON_UNESCAPED_UNICODE));
        }
    }
}
add_action('save_post', 'lti_save_unit_metaboxes');

// Endpoint REST personalizado para debug
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
}
add_action('rest_api_init', 'lti_register_debug_endpoints');

function lti_debug_student_endpoint($request) {
    $sub = $request['sub'];
    
    $students = get_posts(array(
        'post_type' => 'student',
        'meta_key' => 'lms_sub',
        'meta_value' => $sub,
        'posts_per_page' => 1
    ));
    
    if (empty($students)) {
        return new WP_Error('student_not_found', "No student found with lms_sub: {$sub}", array('status' => 404));
    }
    
    $student = $students[0];
    $course_ids = get_post_meta($student->ID, 'course_ids', true);
    $course_ids = $course_ids ? json_decode($course_ids, true) : array();
    
    return array(
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
}

function lti_debug_course_endpoint($request) {
    $context_id = $request['context_id'];
    
    $courses = get_posts(array(
        'post_type' => 'course',
        'meta_key' => 'lms_context_id',
        'meta_value' => $context_id,
        'posts_per_page' => 1
    ));
    
    if (empty($courses)) {
        return new WP_Error('course_not_found', "No course found with lms_context_id: {$context_id}", array('status' => 404));
    }
    
    $course = $courses[0];
    $student_ids = get_post_meta($course->ID, 'student_ids', true);
    $student_ids = $student_ids ? json_decode($student_ids, true) : array();
    
    // Obtener unidades
    $units = get_posts(array(
        'post_type' => 'unit',
        'meta_key' => 'course_id',
        'meta_value' => $course->ID,
        'posts_per_page' => -1
    ));
    
    return array(
        'course' => array(
            'id' => $course->ID,
            'title' => $course->post_title,
            'lms_context_id' => get_post_meta($course->ID, 'lms_context_id', true),
            'student_ids' => $student_ids
        ),
        'units' => array_map(function($unit) {
            $cards = get_post_meta($unit->ID, 'unit_cards', true);
            return array(
                'id' => $unit->ID,
                'title' => $unit->post_title,
                'cards' => $cards ? json_decode($cards, true) : array()
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
}

// Asegurar que los meta fields se muestren en REST
function lti_ensure_meta_in_rest($response, $post, $request) {
    $post_type = $post->post_type;
    
    if (in_array($post_type, array('student', 'course', 'unit', 'progress', 'grade'))) {
        $meta = get_post_meta($post->ID);
        $response->data['meta'] = array();
        
        foreach ($meta as $key => $value) {
            // Solo incluir meta fields que no empiecen con _
            if (substr($key, 0, 1) !== '_') {
                $response->data['meta'][$key] = $value[0];
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

?>