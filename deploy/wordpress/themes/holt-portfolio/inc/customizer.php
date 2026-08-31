<?php
/**
 * Theme Customizer.
 *
 * @package Holt_Portfolio
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register customizer settings.
 *
 * @param WP_Customize_Manager $wp_customize Manager.
 */
function holt_customize_register( WP_Customize_Manager $wp_customize ): void {
	$wp_customize->add_section(
		'holt_profile',
		array(
			'title'    => __( 'Holt 作品集', 'holt-portfolio' ),
			'priority' => 30,
		)
	);

	$fields = array(
		'artist_name'          => array(
			'label'   => __( '艺名', 'holt-portfolio' ),
			'default' => 'Holt',
			'type'    => 'text',
		),
		'tagline'              => array(
			'label'   => __( '一句话介绍', 'holt-portfolio' ),
			'default' => '作曲 · 编曲 · 混音',
			'type'    => 'text',
		),
		'bilibili_space_url'   => array(
			'label'   => __( 'B 站个人空间', 'holt-portfolio' ),
			'default' => 'https://b23.tv/8r56Ehc',
			'type'    => 'url',
		),
		'contact_email'        => array(
			'label'   => __( '联系邮箱', 'holt-portfolio' ),
			'default' => '',
			'type'    => 'email',
		),
		'contact_wechat'       => array(
			'label'   => __( '微信（展示用）', 'holt-portfolio' ),
			'default' => '',
			'type'    => 'text',
		),
		'about_bio'            => array(
			'label'   => __( '关于页简介', 'holt-portfolio' ),
			'default' => '独立音乐人，作品发布于 B 站。欢迎商业合作与编曲委托。',
			'type'    => 'textarea',
		),
		'contact_intro'        => array(
			'label'   => __( '联系页说明', 'holt-portfolio' ),
			'default' => '有编曲、混音或原创音乐需求？留下邮件或直接加微信。',
			'type'    => 'textarea',
		),
		'featured_works_count' => array(
			'label'   => __( '首页精选作品数', 'holt-portfolio' ),
			'default' => '6',
			'type'    => 'number',
		),
	);

	foreach ( $fields as $id => $field ) {
		$wp_customize->add_setting(
			$id,
			array(
				'default'           => $field['default'],
				'sanitize_callback' => $field['type'] === 'url'
					? 'holt_sanitize_url'
					: ( $field['type'] === 'email' ? 'holt_sanitize_email' : 'holt_sanitize_customizer_field' ),
			)
		);

		$control_args = array(
			'label'   => $field['label'],
			'section' => 'holt_profile',
			'settings'=> $id,
		);

		if ( $field['type'] === 'textarea' ) {
			$wp_customize->add_control( $id, $control_args + array( 'type' => 'textarea' ) );
		} elseif ( $field['type'] === 'number' ) {
			$wp_customize->add_control( $id, $control_args + array( 'type' => 'number', 'input_attrs' => array( 'min' => 1, 'max' => 12 ) ) );
		} else {
			$wp_customize->add_control( $id, $control_args );
		}
	}
}
add_action( 'customize_register', 'holt_customize_register' );

/**
 * Sanitize customizer values.
 *
 * @param mixed $value Raw value.
 */
function holt_sanitize_customizer_field( $value ): string {
	if ( is_array( $value ) ) {
		return '';
	}
	return sanitize_text_field( (string) $value );
}

/**
 * Sanitize URL fields.
 *
 * @param mixed $value Raw value.
 */
function holt_sanitize_url( $value ): string {
	return esc_url_raw( (string) $value );
}

/**
 * Sanitize email fields.
 *
 * @param mixed $value Raw value.
 */
function holt_sanitize_email( $value ): string {
	return sanitize_email( (string) $value );
}
