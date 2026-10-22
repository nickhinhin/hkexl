<?php
/**
 * Plugin Name: HKEXL Sitemap Webhook
 * Description: Refreshes the Firebase sitemap through GitHub Actions when published WordPress content changes.
 * Version: 1.0.0
 * Author: HKEXL
 */

if (!defined('ABSPATH')) {
    exit;
}

const HKEXL_SITEMAP_REPO = 'nickhinhin/hkexl';
const HKEXL_SITEMAP_TOKEN_OPTION = 'hkexl_sitemap_github_token';

/** Tell the React site whether this article was explicitly marked noindex in Yoast. */
function hkexl_sitemap_register_index_field() {
    register_rest_field('post', 'hkexl_sitemap_index', array(
        'get_callback' => function ($post) {
            return get_post_meta($post['id'], '_yoast_wpseo_meta-robots-noindex', true) === '1' ? 'noindex' : 'index';
        },
        'schema' => array('type' => 'string', 'enum' => array('index', 'noindex'), 'context' => array('view')),
    ));
}
add_action('rest_api_init', 'hkexl_sitemap_register_index_field');

/** Send a content-change event without putting the GitHub token in a URL or log. */
function hkexl_sitemap_dispatch() {
    $token = get_option(HKEXL_SITEMAP_TOKEN_OPTION, '');
    if (!$token) {
        return new WP_Error('missing_token', 'GitHub token has not been configured.');
    }

    $response = wp_remote_post('https://api.github.com/repos/' . HKEXL_SITEMAP_REPO . '/dispatches', array(
        'timeout' => 8,
        'headers' => array(
            'Accept' => 'application/vnd.github+json',
            'Authorization' => 'Bearer ' . $token,
            'Content-Type' => 'application/json',
            'X-GitHub-Api-Version' => '2022-11-28',
        ),
        'body' => wp_json_encode(array('event_type' => 'hkexl_content_changed')),
    ));
    $status = is_wp_error($response) ? $response->get_error_message() : (string) wp_remote_retrieve_response_code($response);
    update_option('hkexl_sitemap_last_dispatch', array('time' => current_time('mysql'), 'status' => $status), false);
    return !is_wp_error($response) && (int) $status === 204;
}

/** Refresh after Gutenberg has saved post content, taxonomy terms, and metadata. */
function hkexl_sitemap_after_save($post_id, $post, $update, $post_before) {
    if ($post->post_type !== 'post' || wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) {
        return;
    }
    if ($post->post_status === 'publish' || ($post_before && $post_before->post_status === 'publish')) {
        hkexl_sitemap_dispatch();
    }
}
add_action('wp_after_insert_post', 'hkexl_sitemap_after_save', 10, 4);

/** Catch permanent deletion after the post has disappeared from the public API. */
function hkexl_sitemap_after_delete($post_id, $post) {
    if ($post->post_type === 'post' && $post->post_status === 'publish') {
        hkexl_sitemap_dispatch();
    }
}
add_action('after_delete_post', 'hkexl_sitemap_after_delete', 10, 2);

/** Add a restricted settings screen for the repository-scoped dispatch token. */
function hkexl_sitemap_settings_menu() {
    add_options_page('HKEXL Sitemap Webhook', 'HKEXL Sitemap Webhook', 'manage_options', 'hkexl-sitemap-webhook', 'hkexl_sitemap_settings_page');
}
add_action('admin_menu', 'hkexl_sitemap_settings_menu');

/** Store a token only when an administrator supplies one, then optionally send a test event. */
function hkexl_sitemap_save_settings() {
    if (!current_user_can('manage_options')) {
        wp_die('Not allowed.');
    }
    check_admin_referer('hkexl_sitemap_settings');
    $token = isset($_POST['hkexl_token']) ? sanitize_text_field(wp_unslash($_POST['hkexl_token'])) : '';
    if ($token !== '') {
        update_option(HKEXL_SITEMAP_TOKEN_OPTION, $token, false);
    }
    if (!empty($_POST['hkexl_clear_token'])) {
        delete_option(HKEXL_SITEMAP_TOKEN_OPTION);
    }
    $result = !empty($_POST['hkexl_test_dispatch']) ? (hkexl_sitemap_dispatch() === true ? 'sent' : 'failed') : 'saved';
    wp_safe_redirect(add_query_arg('hkexl_result', $result, admin_url('options-general.php?page=hkexl-sitemap-webhook')));
    exit;
}
add_action('admin_post_hkexl_sitemap_settings', 'hkexl_sitemap_save_settings');

/** Show setup status without ever rendering the saved token back to the browser. */
function hkexl_sitemap_settings_page() {
    if (!current_user_can('manage_options')) {
        return;
    }
    $configured = (bool) get_option(HKEXL_SITEMAP_TOKEN_OPTION, '');
    $last = get_option('hkexl_sitemap_last_dispatch', array());
    ?>
    <div class="wrap">
      <h1>HKEXL Sitemap Webhook</h1>
      <p>GitHub repository: <code><?php echo esc_html(HKEXL_SITEMAP_REPO); ?></code></p>
      <p>Token: <?php echo $configured ? 'configured' : 'not configured'; ?></p>
      <?php if ($last) : ?>
        <p>Last dispatch: <?php echo esc_html($last['time'] . ' — ' . $last['status']); ?></p>
      <?php endif; ?>
      <?php if (isset($_GET['hkexl_result'])) : ?>
        <p><?php echo esc_html(sanitize_text_field(wp_unslash($_GET['hkexl_result']))); ?></p>
      <?php endif; ?>
      <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
        <input type="hidden" name="action" value="hkexl_sitemap_settings">
        <?php wp_nonce_field('hkexl_sitemap_settings'); ?>
        <p><label for="hkexl_token">GitHub fine-grained token (this repository, Contents: read/write)</label></p>
        <p><input id="hkexl_token" name="hkexl_token" type="password" size="65" autocomplete="new-password" placeholder="Leave blank to keep the existing token"></p>
        <p><label><input type="checkbox" name="hkexl_clear_token" value="1"> Remove saved token</label></p>
        <p><button class="button button-primary" type="submit">Save</button> <button class="button" type="submit" name="hkexl_test_dispatch" value="1">Save and send test event</button></p>
      </form>
    </div>
    <?php
}
