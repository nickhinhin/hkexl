<?php
/**
 * Every public URL renders the React shell; React reads content from this site's REST API.
 */

if (!defined('ABSPATH')) {
	exit;
}

status_header(200);
nocache_headers();

$shell = file_get_contents(get_template_directory() . '/app/index.html');
$config = array(
	'apiUrl'          => esc_url_raw(rest_url('wp/v2')),
	'canonicalOrigin' => 'https://hkexl.com',
	'noindex'         => true,
);
$origin = wp_parse_url(home_url(), PHP_URL_SCHEME) . '://' . wp_parse_url(home_url(), PHP_URL_HOST);
$head = '<meta name="robots" content="noindex, nofollow" />'
	. '<link rel="preconnect" href="' . esc_url($origin) . '" />'
	. '<script>window.HKEXL_CONFIG = ' . wp_json_encode($config) . ';</script>';

// Drop the Firebase build's CMS preconnect hints and add this site's config before the app script.
$shell = preg_replace('#\s*<link rel="(?:dns-prefetch|preconnect)"[^>]*>#', '', $shell);
$shell = str_replace('</title>', '</title>' . $head, $shell);

echo $shell; // phpcs:ignore WordPress.Security.EscapeOutput -- trusted build output.
