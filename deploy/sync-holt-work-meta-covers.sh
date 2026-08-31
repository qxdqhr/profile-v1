#!/usr/bin/env bash
# 用 JSON 回填 owner/play/series，并分批补导封面（不删帖）。
# 用法：
#   LIMIT=40 ./sync-holt-work-meta-covers.sh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

JSON_HOST="${JSON_HOST:-$ROOT_DIR/wordpress/data/holt-bilibili-works.json}"
LIMIT="${LIMIT:-40}"
OFFSET="${OFFSET:-0}"
SKIP_THUMBNAILS="${SKIP_THUMBNAILS:-0}"

COMPOSE=(docker compose -f docker-compose.gateway.yml)
SERVICE=wordpress_holt

"${COMPOSE[@]}" cp "$JSON_HOST" "${SERVICE}:/tmp/holt-bilibili-works.json"
"${COMPOSE[@]}" exec -T \
  -e LIMIT="${LIMIT}" \
  -e OFFSET="${OFFSET}" \
  -e SKIP_THUMBNAILS="${SKIP_THUMBNAILS}" \
  "${SERVICE}" php <<'PHP'
<?php
require '/var/www/html/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

$items = json_decode( (string) file_get_contents( '/tmp/holt-bilibili-works.json' ), true );
if ( ! is_array( $items ) ) {
	fwrite( STDERR, "bad json\n" );
	exit( 1 );
}

$limit  = max( 1, (int) ( getenv( 'LIMIT' ) ?: 40 ) );
$offset = max( 0, (int) ( getenv( 'OFFSET' ) ?: 0 ) );
$skip   = getenv( 'SKIP_THUMBNAILS' ) === '1';
$slice  = array_slice( $items, $offset, $limit );

$meta_ok = 0;
$thumb_ok = 0;
$thumb_skip = 0;
$thumb_fail = 0;
$missing = 0;

foreach ( $slice as $item ) {
	$url = isset( $item['bilibili_url'] ) ? (string) $item['bilibili_url'] : '';
	if ( $url === '' && ! empty( $item['bvid'] ) ) {
		$url = 'https://www.bilibili.com/video/' . $item['bvid'] . '/';
	}
	if ( $url === '' ) {
		continue;
	}

	$found = get_posts(
		array(
			'post_type'      => 'work',
			'post_status'    => 'any',
			'posts_per_page' => 1,
			'fields'         => 'ids',
			'meta_key'       => 'bilibili_url',
			'meta_value'     => $url,
		)
	);
	if ( ! $found ) {
		$missing++;
		continue;
	}
	$post_id = (int) $found[0];

	if ( ! empty( $item['owner_name'] ) ) {
		update_post_meta( $post_id, '_holt_owner_name', sanitize_text_field( (string) $item['owner_name'] ) );
	}
	if ( ! empty( $item['series_name'] ) ) {
		update_post_meta( $post_id, '_holt_series_name', sanitize_text_field( (string) $item['series_name'] ) );
	}
	if ( isset( $item['stat']['view'] ) ) {
		update_post_meta( $post_id, '_holt_play_count', (int) $item['stat']['view'] );
	}
	if ( ! empty( $item['work_year'] ) ) {
		update_post_meta( $post_id, 'work_year', sanitize_text_field( (string) $item['work_year'] ) );
	}
	$meta_ok++;

	if ( $skip || has_post_thumbnail( $post_id ) ) {
		$thumb_skip++;
		continue;
	}

	$pic = isset( $item['pic'] ) ? (string) $item['pic'] : '';
	if ( $pic === '' ) {
		$thumb_fail++;
		continue;
	}

	$att = media_sideload_image( $pic, $post_id, get_the_title( $post_id ), 'id' );
	if ( is_wp_error( $att ) || ! $att ) {
		$thumb_fail++;
		continue;
	}
	set_post_thumbnail( $post_id, (int) $att );
	$thumb_ok++;
}

echo "slice_offset={$offset} limit={$limit} processed=" . count( $slice ) . PHP_EOL;
echo "meta_ok={$meta_ok} missing={$missing} thumbs_ok={$thumb_ok} thumbs_skip={$thumb_skip} thumbs_fail={$thumb_fail}" . PHP_EOL;
PHP
