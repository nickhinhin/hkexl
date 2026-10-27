<?php
/**
 * HKEXL theme: serves the hkexl.com React build as the public front end.
 */

if (!defined('ABSPATH')) {
	exit;
}

// hkexl.com on Firebase is the canonical site; this copy must stay out of search results.
add_action('send_headers', function () {
	if (!is_admin()) {
		header('X-Robots-Tag: noindex, nofollow', true);
	}
});

// React owns routes such as /process and /posts/<slug>; stop WordPress guessing a different URL.
add_filter('do_redirect_guess_404_permalink', '__return_false');
add_filter('redirect_canonical', function ($redirect) {
	return is_404() ? false : $redirect;
});

// Content now comes from posts and pages; hide theme features the React front end does not use.
add_action('after_setup_theme', function () {
	add_theme_support('title-tag');
	add_theme_support('post-thumbnails');
});
