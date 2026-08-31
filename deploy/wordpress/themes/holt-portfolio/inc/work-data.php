<?php
/**
 * Work display helpers (play count, series, owner, credits).
 *
 * @package Holt_Portfolio
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Play count meta.
 */
function holt_get_work_play_count( int $post_id ): int {
	return max( 0, (int) get_post_meta( $post_id, '_holt_play_count', true ) );
}

/**
 * Series name meta.
 */
function holt_get_work_series( int $post_id ): string {
	return trim( (string) get_post_meta( $post_id, '_holt_series_name', true ) );
}

/**
 * Uploader / owner display name.
 */
function holt_get_work_owner( int $post_id ): string {
	$owner = trim( (string) get_post_meta( $post_id, '_holt_owner_name', true ) );
	if ( $owner !== '' ) {
		return $owner;
	}

	$excerpt = (string) get_the_excerpt( $post_id );
	if ( preg_match( '/投稿账号：([^\s·]+)/u', $excerpt, $m ) ) {
		return trim( $m[1] );
	}

	return '';
}

/**
 * Whether the work is authored by Holt (space host).
 */
function holt_work_is_holt_owned( int $post_id ): bool {
	$owner = holt_get_work_owner( $post_id );
	if ( $owner === '' ) {
		return true;
	}
	$normalized = strtolower( preg_replace( '/[^a-z0-9\x{4e00}-\x{9fff}-]+/iu', '', $owner ) ?? '' );
	return $normalized === 'holt' || $normalized === '-holt-' || str_contains( $normalized, 'holt' );
}

/**
 * Format play count for UI.
 */
function holt_format_play_count( int $count ): string {
	if ( $count >= 10000 ) {
		$wan = $count / 10000;
		return ( $wan >= 10 ? (string) (int) round( $wan ) : number_format( $wan, 1 ) ) . '万';
	}
	if ( $count >= 1000 ) {
		return number_format( $count / 1000, 1 ) . 'k';
	}
	return (string) $count;
}

/**
 * Parse credit lines from work description.
 *
 * @return array<int, array{role: string, name: string}>
 */
function holt_parse_work_credits( int $post_id ): array {
	$content = (string) get_post_field( 'post_content', $post_id );
	if ( $content === '' ) {
		return array();
	}

	$credits = array();
	if ( preg_match_all( '/^(作曲|编曲|作词|混音|调音|曲绘|演唱|翻唱|PV|混音\/调音|调音\/混音)\s*[:：]\s*(.+)$/mu', $content, $matches, PREG_SET_ORDER ) ) {
		foreach ( $matches as $row ) {
			$credits[] = array(
				'role' => trim( $row[1] ),
				'name' => trim( $row[2] ),
			);
		}
	}

	return $credits;
}

/**
 * Distinct series names from published works.
 *
 * @return string[]
 */
function holt_get_series_options(): array {
	global $wpdb;
	$rows = $wpdb->get_col(
		"SELECT DISTINCT meta_value FROM {$wpdb->postmeta} pm
		INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
		WHERE pm.meta_key = '_holt_series_name'
		AND pm.meta_value <> ''
		AND p.post_type = 'work'
		AND p.post_status = 'publish'
		ORDER BY meta_value ASC"
	);
	return array_values( array_filter( array_map( 'strval', $rows ?: array() ) ) );
}

/**
 * Distinct work years.
 *
 * @return string[]
 */
function holt_get_year_options(): array {
	global $wpdb;
	$rows = $wpdb->get_col(
		"SELECT DISTINCT meta_value FROM {$wpdb->postmeta} pm
		INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
		WHERE pm.meta_key = 'work_year'
		AND pm.meta_value <> ''
		AND p.post_type = 'work'
		AND p.post_status = 'publish'
		ORDER BY meta_value DESC"
	);
	return array_values( array_filter( array_map( 'strval', $rows ?: array() ) ) );
}

/**
 * Featured works query ordered by play count.
 */
function holt_query_featured_works( int $count ): WP_Query {
	return new WP_Query(
		array(
			'post_type'      => 'work',
			'posts_per_page' => $count,
			'post_status'    => 'publish',
			'meta_key'       => '_holt_play_count',
			'orderby'        => 'meta_value_num',
			'order'          => 'DESC',
		)
	);
}

/**
 * Build archive work query from request filters.
 *
 * @return array{query: WP_Query, role: string, series: string, year: string, mine: bool}
 */
function holt_get_archive_work_query(): array {
	$role   = isset( $_GET['role'] ) ? sanitize_title( wp_unslash( (string) $_GET['role'] ) ) : '';
	$series = isset( $_GET['series'] ) ? sanitize_text_field( wp_unslash( (string) $_GET['series'] ) ) : '';
	$year   = isset( $_GET['year'] ) ? sanitize_text_field( wp_unslash( (string) $_GET['year'] ) ) : '';
	$mine   = isset( $_GET['mine'] ) && (string) $_GET['mine'] === '1';

	$args = array(
		'post_type'      => 'work',
		'posts_per_page' => 24,
		'paged'          => max( 1, (int) get_query_var( 'paged' ) ),
		'meta_key'       => '_holt_play_count',
		'orderby'        => array(
			'meta_value_num' => 'DESC',
			'date'           => 'DESC',
		),
	);

	$meta_query = array();

	if ( $series !== '' ) {
		$meta_query[] = array(
			'key'   => '_holt_series_name',
			'value' => $series,
		);
	}

	if ( $year !== '' ) {
		$meta_query[] = array(
			'key'   => 'work_year',
			'value' => $year,
		);
	}

	if ( $mine ) {
		$meta_query[] = array(
			'relation' => 'OR',
			array(
				'key'     => '_holt_owner_name',
				'compare' => 'NOT EXISTS',
			),
			array(
				'key'     => '_holt_owner_name',
				'value'   => '',
				'compare' => '=',
			),
			array(
				'key'     => '_holt_owner_name',
				'value'   => 'Holt',
				'compare' => 'LIKE',
			),
			array(
				'key'     => '_holt_owner_name',
				'value'   => '-Holt-',
				'compare' => 'LIKE',
			),
		);
	}

	if ( $meta_query !== array() ) {
		$args['meta_query'] = $meta_query;
	}

	if ( $role !== '' ) {
		$args['tax_query'] = array(
			array(
				'taxonomy' => 'work_role',
				'field'    => 'slug',
				'terms'    => $role,
			),
		);
	}

	return array(
		'query'  => new WP_Query( $args ),
		'role'   => $role,
		'series' => $series,
		'year'   => $year,
		'mine'   => $mine,
	);
}

/**
 * Archive filter URL helper.
 *
 * @param array<string, string|bool> $overrides Overrides.
 */
function holt_works_filter_url( array $overrides = array() ): string {
	$base = array(
		'role'   => isset( $_GET['role'] ) ? sanitize_title( wp_unslash( (string) $_GET['role'] ) ) : '',
		'series' => isset( $_GET['series'] ) ? sanitize_text_field( wp_unslash( (string) $_GET['series'] ) ) : '',
		'year'   => isset( $_GET['year'] ) ? sanitize_text_field( wp_unslash( (string) $_GET['year'] ) ) : '',
		'mine'   => isset( $_GET['mine'] ) && (string) $_GET['mine'] === '1' ? '1' : '',
	);

	foreach ( $overrides as $key => $value ) {
		if ( $value === false || $value === '' || $value === null ) {
			$base[ $key ] = '';
		} else {
			$base[ $key ] = is_bool( $value ) ? ( $value ? '1' : '' ) : (string) $value;
		}
	}

	$url = get_post_type_archive_link( 'work' ) ?: home_url( '/works/' );
	foreach ( $base as $key => $value ) {
		if ( $value === '' ) {
			continue;
		}
		$url = add_query_arg( $key, $value, $url );
	}

	return $url;
}
