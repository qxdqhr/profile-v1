<?php
/**
 * Plugin Name: Holt Gateway Rewrite
 * Description: Pretty permalinks when nginx strips /wp/holt before proxying to WordPress.
 *
 * @package Holt_Portfolio
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Public URL path prefix, e.g. /wp/holt
 */
function holt_public_path_prefix(): string {
	$home = wp_parse_url( home_url( '/' ), PHP_URL_PATH );
	$home = is_string( $home ) ? rtrim( $home, '/' ) : '';
	return $home !== '' ? $home : '/wp/holt';
}

/**
 * Strip subdirectory prefix from rewrite patterns (WP at container root, URLs with /wp/holt).
 *
 * @param array<string, string> $rules Rewrite rules.
 * @return array<string, string>
 */
function holt_strip_subdir_rewrite_rules( array $rules ): array {
	$prefix = trim( holt_public_path_prefix(), '/' );
	if ( $prefix === '' ) {
		return $rules;
	}

	$fixed = array();
	foreach ( $rules as $pattern => $query ) {
		$pattern = preg_replace( '#^' . preg_quote( $prefix, '#' ) . '/#', '', $pattern ) ?? $pattern;
		$fixed[ $pattern ] = $query;
	}

	return $fixed;
}
add_filter( 'rewrite_rules_array', 'holt_strip_subdir_rewrite_rules' );

/**
 * Stored rules in options table are filtered on read as well.
 *
 * @param mixed $rules Rules.
 * @return mixed
 */
function holt_filter_stored_rewrite_rules( $rules ) {
	if ( ! is_array( $rules ) ) {
		return $rules;
	}
	return holt_strip_subdir_rewrite_rules( $rules );
}
add_filter( 'option_rewrite_rules', 'holt_filter_stored_rewrite_rules' );

/**
 * Re-flush when prefix fix version bumps.
 */
function holt_gateway_rewrite_bootstrap(): void {
	$ver = '3';
	if ( get_option( 'holt_gateway_rewrite_ver' ) === $ver ) {
		return;
	}
	flush_rewrite_rules( false );
	update_option( 'holt_gateway_rewrite_ver', $ver, false );
}
add_action( 'init', 'holt_gateway_rewrite_bootstrap', 100 );
