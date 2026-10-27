<?php
/**
 * Plugin Name: HKEXL CMS Fields
 * Description: Adds REST API helpers for the HKEXL React frontend.
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('after_setup_theme', function () {
    add_theme_support('post-thumbnails');
});

add_action('init', function () {
    register_taxonomy('area', ['living'], [
        'label' => '地區',
        'public' => true,
        'show_in_rest' => true,
        'hierarchical' => true,
    ]);

    register_taxonomy('workers_category', ['workers'], [
        'label' => '外勞類型',
        'public' => true,
        'show_in_rest' => true,
        'hierarchical' => true,
    ]);

    register_post_type('living', [
        'label' => '宿舍',
        'public' => true,
        'show_in_rest' => true,
        'supports' => ['title', 'editor', 'thumbnail', 'custom-fields'],
        'menu_icon' => 'dashicons-building',
    ]);

    register_post_type('workers', [
        'label' => '外勞',
        'public' => true,
        'show_in_rest' => true,
        'supports' => ['title', 'editor', 'thumbnail', 'custom-fields'],
        'menu_icon' => 'dashicons-groups',
    ]);

    register_post_type('hkexl_redirect', [
        'label' => '轉址',
        'public' => true,
        'publicly_queryable' => false,
        'exclude_from_search' => true,
        'show_in_nav_menus' => false,
        'show_ui' => true,
        'show_in_rest' => true,
        'supports' => ['title', 'custom-fields'],
        'menu_icon' => 'dashicons-randomize',
        'rest_base' => 'redirects',
    ]);
});

add_action('rest_api_init', function () {
    foreach (['post', 'page', 'living', 'workers'] as $post_type) {
        register_rest_field($post_type, 'hkexl_featured_image', [
            'get_callback' => function ($post) {
                $image_id = get_post_thumbnail_id($post['id']);
                if (!$image_id) {
                    return get_post_meta($post['id'], '_hkexl_seed_image', true) ?: null;
                }
                return wp_get_attachment_image_url($image_id, 'large') ?: get_post_meta($image_id, '_wxr_source_url', true);
            },
            'schema' => [
                'description' => 'Featured image URL for the React frontend.',
                'type' => ['string', 'null'],
                'context' => ['view', 'edit'],
            ],
        ]);

        register_rest_field($post_type, 'hkexl_meta', [
            'get_callback' => function ($post) {
                return [
                    'clock' => get_post_meta($post['id'], 'clock', true),
                    'bus' => get_post_meta($post['id'], 'bus', true),
                    'place' => get_post_meta($post['id'], 'place', true),
                    'experience' => get_post_meta($post['id'], 'experience', true),
                ];
            },
            'schema' => [
                'description' => 'HKEXL imported custom fields.',
                'type' => 'object',
                'context' => ['view', 'edit'],
            ],
        ]);

        register_rest_field($post_type, 'hkexl_seo', [
            'get_callback' => function ($post) {
                return [
                    'title' => get_post_meta($post['id'], '_yoast_wpseo_title', true),
                    'description' => get_post_meta($post['id'], '_yoast_wpseo_metadesc', true),
                ];
            },
            'schema' => [
                'description' => 'Yoast SEO title and description fallback for the React frontend.',
                'type' => 'object',
                'context' => ['view', 'edit'],
            ],
        ]);
    }
});

add_action('add_meta_boxes', function () {
    add_meta_box('hkexl_redirect_settings', 'React 網站轉址設定', function ($post) {
        wp_nonce_field('hkexl_redirect_save', 'hkexl_redirect_nonce');
        $from = get_post_meta($post->ID, 'from_path', true);
        $to = get_post_meta($post->ID, 'to_url', true);
        $status = get_post_meta($post->ID, 'status_code', true) ?: '301';
        ?>
        <p>
            <label for="hkexl_from_path"><strong>來源路徑</strong></label><br>
            <input id="hkexl_from_path" name="hkexl_from_path" type="text" value="<?php echo esc_attr($from); ?>" class="widefat" placeholder="/old-page">
        </p>
        <p>
            <label for="hkexl_to_url"><strong>目標網址</strong></label><br>
            <input id="hkexl_to_url" name="hkexl_to_url" type="text" value="<?php echo esc_attr($to); ?>" class="widefat" placeholder="/new-page 或 https://example.com">
        </p>
        <p>
            <label for="hkexl_status_code"><strong>狀態</strong></label><br>
            <select id="hkexl_status_code" name="hkexl_status_code">
                <option value="301" <?php selected($status, '301'); ?>>301 永久轉址</option>
                <option value="302" <?php selected($status, '302'); ?>>302 暫時轉址</option>
            </select>
        </p>
        <?php
    }, 'hkexl_redirect', 'normal', 'high');
});

add_action('save_post_hkexl_redirect', function ($post_id) {
    if (!isset($_POST['hkexl_redirect_nonce']) || !wp_verify_nonce($_POST['hkexl_redirect_nonce'], 'hkexl_redirect_save')) {
        return;
    }
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }
    update_post_meta($post_id, 'from_path', sanitize_text_field($_POST['hkexl_from_path'] ?? ''));
    update_post_meta($post_id, 'to_url', sanitize_text_field($_POST['hkexl_to_url'] ?? ''));
    update_post_meta($post_id, 'status_code', in_array($_POST['hkexl_status_code'] ?? '301', ['301', '302'], true) ? $_POST['hkexl_status_code'] : '301');
});

add_action('rest_api_init', function () {
    register_rest_field('hkexl_redirect', 'hkexl_redirect', [
        'get_callback' => function ($post) {
            return [
                'from' => get_post_meta($post['id'], 'from_path', true),
                'to' => get_post_meta($post['id'], 'to_url', true),
                'status' => get_post_meta($post['id'], 'status_code', true) ?: '301',
            ];
        },
        'schema' => [
            'description' => 'Redirect rule for the React frontend.',
            'type' => 'object',
            'context' => ['view', 'edit'],
        ],
    ]);
});

function hkexl_react_post_payload($post) {
    $image_id = get_post_thumbnail_id($post->ID);
    $image = $image_id ? wp_get_attachment_image_url($image_id, 'large') : null;
    $legacy_image = $image_id ? get_post_meta($image_id, '_wxr_source_url', true) : null;

    return [
        'id' => $post->ID,
        'slug' => $post->post_name,
        'status' => $post->post_status,
        'title' => [
            'rendered' => get_the_title($post),
        ],
        'content' => [
            'rendered' => apply_filters('the_content', $post->post_content),
        ],
        'excerpt' => [
            'rendered' => apply_filters('the_excerpt', $post->post_excerpt ?: wp_trim_words(wp_strip_all_tags($post->post_content), 55)),
        ],
        'hkexl_featured_image' => $image,
        'hkexl_legacy_featured_image' => $legacy_image,
        'hkexl_meta' => [
            'clock' => get_post_meta($post->ID, 'clock', true),
            'bus' => get_post_meta($post->ID, 'bus', true),
            'place' => get_post_meta($post->ID, 'place', true),
            'experience' => get_post_meta($post->ID, 'experience', true),
        ],
        'hkexl_seo' => [
            'title' => get_post_meta($post->ID, '_yoast_wpseo_title', true),
            'description' => get_post_meta($post->ID, '_yoast_wpseo_metadesc', true),
        ],
    ];
}

add_action('rest_api_init', function () {
    register_rest_route('hkexl/v1', '/posts', [
        'methods' => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function ($request) {
            $args = [
                'post_type' => 'post',
                'post_status' => ['publish', 'draft'],
                'posts_per_page' => min((int) ($request['per_page'] ?: 12), 100),
                'orderby' => 'date',
                'order' => 'DESC',
            ];

            if (!empty($request['slug'])) {
                $args['name'] = sanitize_title($request['slug']);
                $args['posts_per_page'] = 1;
            }

            $query = new WP_Query($args);
            return array_map('hkexl_react_post_payload', $query->posts);
        },
    ]);
});

add_action('rest_api_init', function () {
    register_rest_field('post', 'hkexl_legacy_featured_image', [
        'get_callback' => function ($post) {
            $image_id = get_post_thumbnail_id($post['id']);
            return $image_id ? get_post_meta($image_id, '_wxr_source_url', true) : null;
        },
        'schema' => [
            'description' => 'Original imported image URL.',
            'type' => ['string', 'null'],
            'context' => ['view', 'edit'],
        ],
    ]);
});

add_action('rest_api_init', function () {
    add_filter('rest_pre_serve_request', function ($served) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type');
        return $served;
    }, 15);
});
