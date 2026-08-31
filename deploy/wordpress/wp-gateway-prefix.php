<?php
/**
 * Restore public path prefix stripped by gateway nginx.
 *
 * Loaded via WORDPRESS_CONFIG_EXTRA before wp-settings.php.
 *
 * @package Holt_Portfolio
 */

if ( ! isset( $_SERVER['REQUEST_URI'] ) ) {
	return;
}

$holt_public = getenv( 'WP_HOLT_PUBLIC_URL' ) ?: 'https://qhr062.top/wp/holt';
$holt_prefix = parse_url( $holt_public, PHP_URL_PATH ) ?: '/wp/holt';
$holt_prefix = rtrim( $holt_prefix, '/' );
if ( $holt_prefix === '' ) {
	$holt_prefix = '/wp/holt';
}

$path = parse_url( $_SERVER['REQUEST_URI'], PHP_URL_PATH );
$path = is_string( $path ) && $path !== '' ? $path : '/';
$query = isset( $_SERVER['QUERY_STRING'] ) && $_SERVER['QUERY_STRING'] !== ''
	? '?' . $_SERVER['QUERY_STRING']
	: '';

if ( $path === '/' || strncmp( $path, $holt_prefix, strlen( $holt_prefix ) ) !== 0 ) {
	$_SERVER['REQUEST_URI'] = $holt_prefix . ( $path === '/' ? '/' : $path ) . $query;
}
