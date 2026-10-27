<?php
/**
 * Plugin Name: HKEXL Headless SEO & Tracking Bridge
 * Description: Shares Yoast SEO, Site Kit, and GTM4WP settings with the Firebase website while keeping this WordPress frontend out of search results.
 * Version: 1.0.1
 * Author: HKEXL
 */

if (!defined('ABSPATH')) {
    exit;
}

/** Return true when a plugin file containing the supplied fragment is active. */
function hkexl_bridge_plugin_active($fragment) {
    $plugins = (array) get_option('active_plugins', array());
    if (is_multisite()) {
        $plugins = array_merge($plugins, array_keys((array) get_site_option('active_sitewide_plugins', array())));
    }
    foreach ($plugins as $plugin) {
        if (strpos($plugin, $fragment) !== false) {
            return true;
        }
    }
    return false;
}

/** Extract valid public tracking IDs from a plugin option without exposing other settings. */
function hkexl_bridge_extract_ids($value, $pattern) {
    $encoded = wp_json_encode($value);
    preg_match_all($pattern, (string) $encoded, $matches);
    return array_values(array_unique($matches[0] ?? array()));
}

/** Read one non-empty option value from a list of possible plugin field names. */
function hkexl_bridge_first_value($options, $keys, $fallback = '') {
    foreach ($keys as $key) {
        if (isset($options[$key]) && is_scalar($options[$key]) && trim((string) $options[$key]) !== '') {
            return (string) $options[$key];
        }
    }
    return $fallback;
}

/** Check whether Site Kit is allowed to place its frontend snippet. */
function hkexl_bridge_sitekit_snippet_enabled($options) {
    return !array_key_exists('useSnippet', $options) || (bool) $options['useSnippet'];
}

/** Build the public, non-sensitive configuration consumed by the React website. */
function hkexl_bridge_site_config() {
    nocache_headers();
    do_action('litespeed_control_set_nocache', 'HKEXL bridge settings must remain current');
    $yoast_active = hkexl_bridge_plugin_active('wordpress-seo/');
    $sitekit_active = hkexl_bridge_plugin_active('google-site-kit/');
    $gtm4wp_active = hkexl_bridge_plugin_active('duracelltomi-google-tag-manager/');

    $titles = $yoast_active ? (array) get_option('wpseo_titles', array()) : array();
    $social = $yoast_active ? (array) get_option('wpseo_social', array()) : array();
    $sitekit_gtm = $sitekit_active ? (array) get_option('googlesitekit_tagmanager', array()) : array();
    $sitekit_ga = $sitekit_active ? (array) get_option('googlesitekit_analytics-4', array()) : array();
    $gtm4wp = $gtm4wp_active ? (array) get_option('GTM4WP-options', get_option('gtm4wp-options', array())) : array();

    $gtm_ids = array();
    $ga_ids = array();
    if ($gtm4wp_active) {
        $gtm_ids = array_merge($gtm_ids, hkexl_bridge_extract_ids($gtm4wp, '/GTM-[A-Z0-9]+/i'));
    }
    if ($sitekit_active && hkexl_bridge_sitekit_snippet_enabled($sitekit_gtm)) {
        $gtm_ids = array_merge($gtm_ids, hkexl_bridge_extract_ids($sitekit_gtm, '/GTM-[A-Z0-9]+/i'));
    }
    if ($sitekit_active && hkexl_bridge_sitekit_snippet_enabled($sitekit_ga)) {
        $ga_ids = array_merge($ga_ids, hkexl_bridge_extract_ids($sitekit_ga, '/G-[A-Z0-9]+/i'));
    }

    $response = rest_ensure_response(array(
        'seo' => array(
            'siteName' => hkexl_bridge_first_value($titles, array('website_name', 'company_name'), get_bloginfo('name')),
            'homeTitle' => hkexl_bridge_first_value($titles, array('title-home-wpseo'), ''),
            'homeDescription' => hkexl_bridge_first_value($titles, array('metadesc-home-wpseo'), get_bloginfo('description')),
            'defaultDescription' => get_bloginfo('description'),
            'defaultImage' => hkexl_bridge_first_value($social, array('og_default_image'), ''),
            'twitterSite' => hkexl_bridge_first_value($social, array('twitter_site'), ''),
        ),
        'tracking' => array(
            'gtmContainerIds' => array_values(array_unique(array_map('strtoupper', $gtm_ids))),
            'gaMeasurementIds' => array_values(array_unique(array_map('strtoupper', $ga_ids))),
            'siteKitActive' => $sitekit_active,
            'gtm4wpActive' => $gtm4wp_active,
        ),
        'seoPluginActive' => $yoast_active,
        'wordpressNoIndex' => true,
        'updatedAt' => gmdate('c'),
    ));
    $response->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    return $response;
}

/** Register the read-only bridge endpoint. */
function hkexl_bridge_register_routes() {
    register_rest_route('hkexl/v1', '/site-config', array(
        'methods' => WP_REST_Server::READABLE,
        'callback' => 'hkexl_bridge_site_config',
        'permission_callback' => '__return_true',
    ));
}
add_action('rest_api_init', 'hkexl_bridge_register_routes');

/** Keep the WordPress-rendered copy out of search results; Firebase remains canonical. */
function hkexl_bridge_noindex_robots($robots) {
    if (!is_admin()) {
        $robots['noindex'] = true;
        $robots['nofollow'] = true;
        unset($robots['index'], $robots['follow']);
    }
    return $robots;
}
add_filter('wp_robots', 'hkexl_bridge_noindex_robots', 100);

/** Add an HTTP-level noindex instruction for crawlers that do not parse page markup. */
function hkexl_bridge_noindex_header() {
    if (!is_admin() && !(defined('REST_REQUEST') && REST_REQUEST)) {
        header('X-Robots-Tag: noindex, nofollow', true);
    }
}
add_action('send_headers', 'hkexl_bridge_noindex_header');
