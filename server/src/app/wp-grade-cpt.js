/**
 * Snippet para WordPress - Registrar CPT Grade y Meta Fields
 * 
 * Este código debe añadirse al functions.php del tema activo o como plugin.
 * Registra el CPT 'grade' y todos los meta fields necesarios para la integración.
 */

const wpGradeCPTSnippet = `
<?php
// Registrar CPT Grade
function register_grade_cpt() {
    $labels = array(
        'name' => 'Notas',
        'singular_name' => 'Nota',
        'menu_name' => 'Notas',
        'add_new' => 'Añadir Nota',
        'add_new_item' => 'Añadir Nueva Nota',
        'edit_item' => 'Editar Nota',
        'new_item' => 'Nueva Nota',
        'view_item' => 'Ver Nota',
        'search_items' => 'Buscar Notas',
        'not_found' => 'No se encontraron notas',
        'not_found_in_trash' => 'No se encontraron notas en la papelera'
    );

    $args = array(
        'labels' => $labels,
        'public' => false,
        'show_ui' => true,
        'show_in_menu' => true,
        'show_in_rest' => true,
        'rest_base' => 'grade',
        'supports' => array('title', 'custom-fields'),
        'menu_icon' => 'dashicons-welcome-learn-more',
        'menu_position' => 24,
        'capability_type' => 'post',
        'has_archive' => false,
        'hierarchical' => false,
        'rewrite' => array('slug' => 'grade')
    );

    register_post_type('grade', $args);
}
add_action('init', 'register_grade_cpt');

// Registrar meta fields para todos los CPTs
function register_lti_meta_fields() {
    // Meta fields para Student
    register_meta('student', '_lms_sub', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'LMS Subject ID'
    ));
    
    register_meta('student', '_email', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'Email del estudiante'
    ));
    
    register_meta('student', '_full_name', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'Nombre completo'
    ));
    
    register_meta('student', '_course_ids', array(
        'type' => 'array',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'IDs de cursos vinculados'
    ));

    // Meta fields para Course
    register_meta('course', '_lms_context_id', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'LMS Context ID'
    ));
    
    register_meta('course', '_lms_context_label', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'LMS Context Label'
    ));
    
    register_meta('course', '_lms_context_title', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'LMS Context Title'
    ));
    
    register_meta('course', '_student_ids', array(
        'type' => 'array',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'IDs de estudiantes vinculados'
    ));

    // Meta fields para Unit
    register_meta('unit', '_course_id', array(
        'type' => 'integer',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'ID del curso'
    ));
    
    register_meta('unit', '_unit_cards', array(
        'type' => 'array',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'Cards de la unidad (JSON)'
    ));
    
    register_meta('unit', '_unit_settings', array(
        'type' => 'object',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'Configuración de la unidad (JSON)'
    ));

    // Meta fields para Progress
    register_meta('progress', '_student_id', array(
        'type' => 'integer',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'ID del estudiante'
    ));
    
    register_meta('progress', '_course_id', array(
        'type' => 'integer',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'ID del curso'
    ));
    
    register_meta('progress', '_unit_id', array(
        'type' => 'integer',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'ID de la unidad'
    ));
    
    register_meta('progress', '_completed_card_ids', array(
        'type' => 'array',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'IDs de cards completadas'
    ));
    
    register_meta('progress', '_percent', array(
        'type' => 'integer',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'Porcentaje de progreso (0-100)'
    ));

    // Meta fields para Grade
    register_meta('grade', '_student_id', array(
        'type' => 'integer',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'ID del estudiante'
    ));
    
    register_meta('grade', '_course_id', array(
        'type' => 'integer',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'ID del curso'
    ));
    
    register_meta('grade', '_lineitem_id', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'LTI Line Item ID'
    ));
    
    register_meta('grade', '_score_given', array(
        'type' => 'number',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'Puntuación obtenida'
    ));
    
    register_meta('grade', '_score_maximum', array(
        'type' => 'number',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'Puntuación máxima'
    ));
    
    register_meta('grade', '_activity_title', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'Título de la actividad'
    ));
    
    register_meta('grade', '_attempt_id', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'ID del intento'
    ));
    
    register_meta('grade', '_timestamp', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'Timestamp ISO8601'
    ));
    
    register_meta('grade', '_provenance', array(
        'type' => 'string',
        'single' => true,
        'show_in_rest' => true,
        'description' => 'Origen: lms|app'
    ));
}
add_action('init', 'register_lti_meta_fields');

// Añadir metabox para Unit Cards (opcional, para admin)
function add_unit_cards_metabox() {
    add_meta_box(
        'unit_cards_metabox',
        'Cards de la Unidad',
        'unit_cards_metabox_callback',
        'unit',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'add_unit_cards_metabox');

function unit_cards_metabox_callback($post) {
    wp_nonce_field('unit_cards_nonce', 'unit_cards_nonce');
    
    $cards = get_post_meta($post->ID, '_unit_cards', true) ?: array();
    $settings = get_post_meta($post->ID, '_unit_settings', true) ?: array();
    
    echo '<div id="unit-cards-editor">';
    echo '<p><strong>Cards JSON:</strong></p>';
    echo '<textarea name="unit_cards" rows="10" cols="80" style="width:100%">' . esc_textarea(json_encode($cards, JSON_PRETTY_PRINT)) . '</textarea>';
    echo '<p><em>Formato: [{"id":"card-1","title":"Video 1","url":"https://...","tipoActividad":"video","color":"#2dd4bf","peso":1,"estado":"pendiente"}]</em></p>';
    
    echo '<p><strong>Settings JSON:</strong></p>';
    echo '<textarea name="unit_settings" rows="5" cols="80" style="width:100%">' . esc_textarea(json_encode($settings, JSON_PRETTY_PRINT)) . '</textarea>';
    echo '</div>';
}

function save_unit_cards_metabox($post_id) {
    if (!isset($_POST['unit_cards_nonce']) || !wp_verify_nonce($_POST['unit_cards_nonce'], 'unit_cards_nonce')) {
        return;
    }

    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }

    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    if (isset($_POST['unit_cards'])) {
        $cards = json_decode(stripslashes($_POST['unit_cards']), true);
        if (json_last_error() === JSON_ERROR_NONE) {
            update_post_meta($post_id, '_unit_cards', $cards);
        }
    }

    if (isset($_POST['unit_settings'])) {
        $settings = json_decode(stripslashes($_POST['unit_settings']), true);
        if (json_last_error() === JSON_ERROR_NONE) {
            update_post_meta($post_id, '_unit_settings', $settings);
        }
    }
}
add_action('save_post', 'save_unit_cards_metabox');
?>`;

export { wpGradeCPTSnippet };