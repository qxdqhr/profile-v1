<?php
/**
 * One-time demo works for empty sites (acceptance / theme preview).
 *
 * @package Holt_Portfolio
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Seed placeholder works when the site has none (runs once).
 */
function holt_maybe_seed_demo_works(): void {
	if ( get_option( 'holt_demo_works_seeded' ) ) {
		return;
	}

	$existing = get_posts(
		array(
			'post_type'      => 'work',
			'post_status'    => 'any',
			'posts_per_page' => 1,
			'fields'         => 'ids',
		)
	);

	if ( $existing !== array() ) {
		update_option( 'holt_demo_works_seeded', '1', false );
		return;
	}

	$demos = array(
		array(
			'title'        => '（示例）原创单曲 Demo',
			'excerpt'      => '后台可删除或编辑此示例作品，替换为 Holt 的真实 B 站 PV 链接。',
			'bilibili_url' => 'https://www.bilibili.com/video/BV1GJ411x7h7/',
			'work_year'    => '2024',
			'roles'        => array( '作曲', '编曲' ),
		),
		array(
			'title'        => '（示例）编曲合作 PV',
			'excerpt'      => '展示作品卡片、B 站外链与单页播放器嵌入效果。',
			'bilibili_url' => 'https://www.bilibili.com/video/BV1xx411c7mD/',
			'work_year'    => '2023',
			'roles'        => array( '编曲', '混音' ),
		),
		array(
			'title'        => '（示例）混音作品',
			'excerpt'      => '可在「作品链接」中填写可选 audio_url 以启用 HTML5 迷你播放器。',
			'bilibili_url' => 'https://www.bilibili.com/video/BV1xx411c7mU/',
			'work_year'    => '2022',
			'roles'        => array( '混音' ),
		),
	);

	foreach ( $demos as $demo ) {
		$post_id = wp_insert_post(
			array(
				'post_title'   => $demo['title'],
				'post_excerpt' => $demo['excerpt'],
				'post_status'  => 'publish',
				'post_type'    => 'work',
			),
			true
		);

		if ( is_wp_error( $post_id ) || ! $post_id ) {
			continue;
		}

		update_post_meta( $post_id, 'bilibili_url', $demo['bilibili_url'] );
		update_post_meta( $post_id, 'work_year', $demo['work_year'] );
		wp_set_object_terms( $post_id, $demo['roles'], 'work_role' );
	}

	update_option( 'holt_demo_works_seeded', '1', false );
}
