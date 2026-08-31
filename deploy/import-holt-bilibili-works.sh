#!/usr/bin/env bash
# 将 deploy/wordpress/data/holt-bilibili-works.json 导入 wordpress_holt（仅数据，不改主题）。
# 用法（在 /root/profile-v1）：
#   ./import-holt-bilibili-works.sh
# 可选：
#   REPLACE_EXISTING=1  删除全部已有 work（含示例）后重导
#   SKIP_THUMBNAILS=1   不下载封面（更快）
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

JSON_HOST="${JSON_HOST:-$ROOT_DIR/wordpress/data/holt-bilibili-works.json}"
if [ ! -f "$JSON_HOST" ]; then
  echo "ERROR: missing $JSON_HOST" >&2
  exit 1
fi

COMPOSE=(docker compose -f docker-compose.gateway.yml)
SERVICE=wordpress_holt
REPLACE_EXISTING="${REPLACE_EXISTING:-1}"
SKIP_THUMBNAILS="${SKIP_THUMBNAILS:-0}"
SPACE_URL="${SPACE_URL:-https://b23.tv/8r56Ehc}"

if ! "${COMPOSE[@]}" ps --status running --services 2>/dev/null | grep -qx "${SERVICE}"; then
  echo "ERROR: ${SERVICE} not running" >&2
  exit 1
fi

echo "=== copy JSON into container ==="
"${COMPOSE[@]}" cp "$JSON_HOST" "${SERVICE}:/tmp/holt-bilibili-works.json"

echo "=== import works (replace=${REPLACE_EXISTING}, skip_thumbs=${SKIP_THUMBNAILS}) ==="
"${COMPOSE[@]}" exec -T \
  -e REPLACE_EXISTING="${REPLACE_EXISTING}" \
  -e SKIP_THUMBNAILS="${SKIP_THUMBNAILS}" \
  -e SPACE_URL="${SPACE_URL}" \
  "${SERVICE}" php <<'PHP'
<?php
require '/var/www/html/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

$path = '/tmp/holt-bilibili-works.json';
$raw  = file_get_contents( $path );
$items = json_decode( $raw, true );
if ( ! is_array( $items ) ) {
	fwrite( STDERR, "ERROR: invalid JSON\n" );
	exit( 1 );
}

$replace = getenv( 'REPLACE_EXISTING' ) === '1';
$skip_thumbs = getenv( 'SKIP_THUMBNAILS' ) === '1';
$space_url = getenv( 'SPACE_URL' ) ?: 'https://b23.tv/8r56Ehc';

if ( $replace ) {
	$existing = get_posts(
		array(
			'post_type'      => 'work',
			'post_status'    => 'any',
			'posts_per_page' => -1,
			'fields'         => 'ids',
		)
	);
	foreach ( $existing as $pid ) {
		wp_delete_post( (int) $pid, true );
	}
	echo 'deleted_existing=' . count( $existing ) . PHP_EOL;
}

set_theme_mod( 'bilibili_space_url', $space_url );
set_theme_mod( 'artist_name', 'Holt' );
update_option( 'holt_demo_works_seeded', '1', false );

$created = 0;
$updated = 0;
$skipped = 0;
$thumb_ok = 0;
$thumb_fail = 0;

foreach ( $items as $item ) {
	$bvid = isset( $item['bvid'] ) ? (string) $item['bvid'] : '';
	$url  = isset( $item['bilibili_url'] ) ? (string) $item['bilibili_url'] : '';
	if ( $bvid === '' && $url === '' ) {
		$skipped++;
		continue;
	}
	if ( $url === '' ) {
		$url = 'https://www.bilibili.com/video/' . $bvid . '/';
	}

	$title = isset( $item['title'] ) ? wp_strip_all_tags( (string) $item['title'] ) : $bvid;
	$desc  = isset( $item['desc'] ) ? (string) $item['desc'] : '';
	$year  = isset( $item['work_year'] ) ? (string) $item['work_year'] : '';
	$roles = isset( $item['roles'] ) && is_array( $item['roles'] ) ? $item['roles'] : array( '其他' );
	$series = isset( $item['series_name'] ) ? (string) $item['series_name'] : '';
	$pic   = isset( $item['pic'] ) ? (string) $item['pic'] : '';
	$pub   = isset( $item['pubdate'] ) ? (int) $item['pubdate'] : 0;

	$excerpt_parts = array();
	if ( $series !== '' ) {
		$excerpt_parts[] = '合集：' . $series;
	}
	$view = null;
	if ( isset( $item['stat']['view'] ) ) {
		$view = (int) $item['stat']['view'];
		$excerpt_parts[] = '播放 ' . $view;
	}
	$owner = isset( $item['owner_name'] ) ? (string) $item['owner_name'] : '';
	if ( $owner !== '' && $owner !== '-Holt-' && strcasecmp( $owner, 'Holt' ) !== 0 ) {
		$excerpt_parts[] = '投稿账号：' . $owner;
	}
	$excerpt = implode( ' · ', $excerpt_parts );

	$postarr = array(
		'post_title'   => $title,
		'post_content' => $desc,
		'post_excerpt' => $excerpt,
		'post_status'  => 'publish',
		'post_type'    => 'work',
	);
	if ( $pub > 0 ) {
		$postarr['post_date']     = gmdate( 'Y-m-d H:i:s', $pub );
		$postarr['post_date_gmt'] = gmdate( 'Y-m-d H:i:s', $pub );
	}

	// Upsert by bilibili_url meta if not replacing everything.
	$post_id = 0;
	if ( ! $replace ) {
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
		if ( $found ) {
			$post_id = (int) $found[0];
			$postarr['ID'] = $post_id;
		}
	}

	$result = wp_insert_post( $postarr, true );
	if ( is_wp_error( $result ) || ! $result ) {
		fwrite( STDERR, 'FAIL ' . $bvid . ' ' . ( is_wp_error( $result ) ? $result->get_error_message() : 'unknown' ) . "\n" );
		$skipped++;
		continue;
	}
	$post_id = (int) $result;
	if ( isset( $postarr['ID'] ) ) {
		$updated++;
	} else {
		$created++;
	}

	update_post_meta( $post_id, 'bilibili_url', esc_url_raw( $url ) );
	update_post_meta( $post_id, 'work_year', sanitize_text_field( $year ) );
	if ( $bvid !== '' ) {
		update_post_meta( $post_id, '_holt_bvid', sanitize_text_field( $bvid ) );
	}
	if ( $series !== '' ) {
		update_post_meta( $post_id, '_holt_series_name', sanitize_text_field( $series ) );
	}
	$owner_name = isset( $item['owner_name'] ) ? (string) $item['owner_name'] : '';
	if ( $owner_name !== '' ) {
		update_post_meta( $post_id, '_holt_owner_name', sanitize_text_field( $owner_name ) );
	}
	if ( $view !== null ) {
		update_post_meta( $post_id, '_holt_play_count', $view );
	}
	wp_set_object_terms( $post_id, array_map( 'strval', $roles ), 'work_role' );

	if ( ! $skip_thumbs && $pic !== '' && ! has_post_thumbnail( $post_id ) ) {
		$att_id = media_sideload_image( $pic, $post_id, $title, 'id' );
		if ( ! is_wp_error( $att_id ) && $att_id ) {
			set_post_thumbnail( $post_id, (int) $att_id );
			$thumb_ok++;
		} else {
			$thumb_fail++;
		}
	}
}

echo 'created=' . $created . ' updated=' . $updated . ' skipped=' . $skipped . PHP_EOL;
echo 'thumbs_ok=' . $thumb_ok . ' thumbs_fail=' . $thumb_fail . PHP_EOL;
echo 'total_works=' . count( get_posts( array( 'post_type' => 'work', 'post_status' => 'publish', 'posts_per_page' => -1, 'fields' => 'ids' ) ) ) . PHP_EOL;
echo 'space_url=' . $space_url . PHP_EOL;
PHP
