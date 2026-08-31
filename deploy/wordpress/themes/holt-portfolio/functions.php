<?php
/**
 * Holt Portfolio theme bootstrap.
 *
 * @package Holt_Portfolio
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'HOLT_THEME_VERSION', '1.1.0' );
define( 'HOLT_THEME_DIR', get_template_directory() );
define( 'HOLT_THEME_URI', get_template_directory_uri() );

require_once HOLT_THEME_DIR . '/inc/bilibili.php';
require_once HOLT_THEME_DIR . '/inc/work-data.php';
require_once HOLT_THEME_DIR . '/inc/cpt-work.php';
require_once HOLT_THEME_DIR . '/inc/meta-box.php';
require_once HOLT_THEME_DIR . '/inc/customizer.php';
require_once HOLT_THEME_DIR . '/inc/nav-fallback.php';
require_once HOLT_THEME_DIR . '/inc/demo-works.php';

/**
 * Theme setup.
 */
function holt_setup(): void {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support(
		'html5',
		array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' )
	);

	register_nav_menus(
		array(
			'primary' => __( '主导航', 'holt-portfolio' ),
		)
	);

	add_image_size( 'holt-work-card', 640, 360, true );
}
add_action( 'after_setup_theme', 'holt_setup' );

/**
 * Enqueue assets.
 */
function holt_enqueue_assets(): void {
	wp_enqueue_style(
		'holt-portfolio',
		HOLT_THEME_URI . '/assets/main.css',
		array(),
		HOLT_THEME_VERSION
	);

	wp_enqueue_script(
		'holt-portfolio',
		HOLT_THEME_URI . '/assets/main.js',
		array(),
		HOLT_THEME_VERSION,
		true
	);
}
add_action( 'wp_enqueue_scripts', 'holt_enqueue_assets' );

/**
 * Customizer defaults helper.
 */
function holt_mod( string $key, string $default = '' ): string {
	return (string) get_theme_mod( $key, $default );
}

/**
 * Artist display name.
 */
function holt_artist_name(): string {
	$name = holt_mod( 'artist_name', 'Holt' );
	return $name !== '' ? $name : 'Holt';
}

/**
 * Bilibili space URL.
 */
function holt_bilibili_space_url(): string {
	return holt_mod( 'bilibili_space_url', 'https://b23.tv/8r56Ehc' );
}

/**
 * Featured works count on home.
 */
function holt_featured_count(): int {
	return max( 1, min( 12, (int) holt_mod( 'featured_works_count', '6' ) ) );
}

/**
 * Body classes.
 */
function holt_body_classes( array $classes ): array {
	$classes[] = 'holt-theme';
	return $classes;
}
add_filter( 'body_class', 'holt_body_classes' );

/**
 * Bootstrap pages, roles, and rewrites (runs once per theme version).
 */
function holt_theme_bootstrap(): void {
	holt_register_work_cpt();
	holt_register_work_role_taxonomy();
	holt_seed_work_roles();
	holt_ensure_pages();
	holt_ensure_pretty_permalinks();
	holt_maybe_seed_demo_works();

	$target = HOLT_THEME_VERSION;
	if ( get_option( 'holt_bootstrap_version' ) === $target ) {
		return;
	}

	flush_rewrite_rules( false );
	update_option( 'holt_bootstrap_version', $target, false );
}
add_action( 'init', 'holt_theme_bootstrap', 99 );

/**
 * Enable post name permalinks (required for /about/ behind /wp/holt/ gateway).
 */
function holt_ensure_pretty_permalinks(): void {
	$structure = (string) get_option( 'permalink_structure' );
	if ( $structure !== '' && ! str_contains( $structure, 'index.php' ) ) {
		return;
	}
	update_option( 'permalink_structure', '/%postname%/' );
}

/**
 * Create about/contact pages if missing (works uses CPT archive only).
 */
function holt_ensure_pages(): void {
	$pages = array(
		'about'   => array(
			'title'    => '关于',
			'template' => 'page-about.php',
		),
		'contact' => array(
			'title'    => '联系',
			'template' => 'page-contact.php',
		),
	);

	foreach ( $pages as $slug => $cfg ) {
		if ( get_page_by_path( $slug ) ) {
			continue;
		}

		$page_id = wp_insert_post(
			array(
				'post_title'  => $cfg['title'],
				'post_name'   => $slug,
				'post_status' => 'publish',
				'post_type'   => 'page',
			)
		);

		if ( $page_id && ! is_wp_error( $page_id ) ) {
			update_post_meta( $page_id, '_wp_page_template', $cfg['template'] );
		}
	}
}

/**
 * On theme switch: flush rewrites for work CPT.
 */
function holt_activation(): void {
	delete_option( 'holt_bootstrap_version' );
	holt_theme_bootstrap();
}
add_action( 'after_switch_theme', 'holt_activation' );

/**
 * @deprecated Use holt_ensure_pages via holt_theme_bootstrap.
 */
function holt_maybe_seed_pages(): void {
	holt_ensure_pages();
}

/**
 * Works archive URL.
 */
function holt_works_url(): string {
	$archive = get_post_type_archive_link( 'work' );
	if ( $archive ) {
		return $archive;
	}
	$page = get_page_by_path( 'works' );
	return $page ? get_permalink( $page ) : home_url( '/works/' );
}
