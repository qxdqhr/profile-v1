<?php
/**
 * Bilibili URL helpers.
 *
 * @package Holt_Portfolio
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Extract BVID from URL or raw input.
 */
function holt_extract_bvid( string $input ): string {
	$input = trim( $input );
	if ( $input === '' ) {
		return '';
	}

	if ( preg_match( '/(BV[a-zA-Z0-9]+)/i', $input, $matches ) ) {
		return strtoupper( $matches[1] );
	}

	if ( preg_match( '#(?:b23\.tv|bilibili\.com)#i', $input ) ) {
		$response = wp_remote_get(
			$input,
			array(
				'timeout'     => 12,
				'redirection' => 5,
				'user-agent'  => 'HoltPortfolio/1.0',
			)
		);

		if ( ! is_wp_error( $response ) ) {
			$body = (string) wp_remote_retrieve_body( $response );
			if ( preg_match( '/(BV[a-zA-Z0-9]+)/i', $body, $matches ) ) {
				return strtoupper( $matches[1] );
			}
		}
	}

	return '';
}

/**
 * Normalize bilibili video URL for outbound links.
 */
function holt_normalize_bilibili_url( string $input ): string {
	$input = trim( $input );
	if ( $input === '' ) {
		return '';
	}

	$bvid = holt_extract_bvid( $input );
	if ( $bvid !== '' ) {
		return 'https://www.bilibili.com/video/' . $bvid . '/';
	}

	if ( filter_var( $input, FILTER_VALIDATE_URL ) ) {
		return $input;
	}

	return '';
}

/**
 * Build embed player URL.
 */
function holt_bilibili_embed_url( string $input ): string {
	$bvid = holt_extract_bvid( $input );
	if ( $bvid === '' ) {
		return '';
	}

	return 'https://player.bilibili.com/player.html?bvid=' . rawurlencode( $bvid ) . '&high_quality=1&autoplay=0';
}

/**
 * Get work bilibili fields.
 *
 * @return array{bilibili_url: string, bvid: string, embed_url: string}
 */
function holt_get_work_bilibili( int $post_id ): array {
	$raw = (string) get_post_meta( $post_id, 'bilibili_url', true );
	$url = holt_normalize_bilibili_url( $raw );

	return array(
		'bilibili_url' => $url !== '' ? $url : $raw,
		'bvid'         => holt_extract_bvid( $raw ),
		'embed_url'    => holt_bilibili_embed_url( $raw ),
	);
}

/**
 * Get optional audio URL for a work.
 */
function holt_get_work_audio_url( int $post_id ): string {
	return trim( (string) get_post_meta( $post_id, 'audio_url', true ) );
}

/**
 * Get work year.
 */
function holt_get_work_year( int $post_id ): string {
	$year = trim( (string) get_post_meta( $post_id, 'work_year', true ) );
	if ( $year !== '' ) {
		return $year;
	}
	return (string) get_the_date( 'Y', $post_id );
}
