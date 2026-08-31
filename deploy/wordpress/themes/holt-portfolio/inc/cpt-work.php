<?php
/**
 * Work custom post type and taxonomy.
 *
 * @package Holt_Portfolio
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register work CPT.
 */
function holt_register_work_cpt(): void {
	register_post_type(
		'work',
		array(
			'labels'       => array(
				'name'          => __( '作品', 'holt-portfolio' ),
				'singular_name' => __( '作品', 'holt-portfolio' ),
				'add_new_item'  => __( '添加作品', 'holt-portfolio' ),
				'edit_item'     => __( '编辑作品', 'holt-portfolio' ),
			),
			'public'       => true,
			'has_archive'  => true,
			'rewrite'      => array( 'slug' => 'works' ),
			'menu_icon'    => 'dashicons-format-audio',
			'supports'     => array( 'title', 'editor', 'thumbnail', 'excerpt' ),
			'show_in_rest' => true,
		)
	);
}
add_action( 'init', 'holt_register_work_cpt' );

/**
 * Register work role taxonomy.
 */
function holt_register_work_role_taxonomy(): void {
	register_taxonomy(
		'work_role',
		'work',
		array(
			'labels'       => array(
				'name'          => __( '参与角色', 'holt-portfolio' ),
				'singular_name' => __( '角色', 'holt-portfolio' ),
			),
			'public'       => true,
			'hierarchical' => false,
			'rewrite'      => array( 'slug' => 'work-role' ),
			'show_in_rest' => true,
		)
	);
}
add_action( 'init', 'holt_register_work_role_taxonomy' );

/**
 * Seed default work roles on theme switch.
 */
function holt_seed_work_roles(): void {
	$roles = array( '作曲', '编曲', '混音', '演唱', '其他' );
	foreach ( $roles as $role ) {
		if ( ! term_exists( $role, 'work_role' ) ) {
			wp_insert_term( $role, 'work_role' );
		}
	}
}
