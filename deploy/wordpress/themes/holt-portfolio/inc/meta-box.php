<?php
/**
 * Work meta box.
 *
 * @package Holt_Portfolio
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register meta box.
 */
function holt_register_work_meta_box(): void {
	add_meta_box(
		'holt_work_details',
		__( '作品链接', 'holt-portfolio' ),
		'holt_render_work_meta_box',
		'work',
		'normal',
		'high'
	);
}
add_action( 'add_meta_boxes', 'holt_register_work_meta_box' );

/**
 * Render meta box fields.
 *
 * @param WP_Post $post Post.
 */
function holt_render_work_meta_box( WP_Post $post ): void {
	wp_nonce_field( 'holt_save_work_meta', 'holt_work_meta_nonce' );

	$bilibili = (string) get_post_meta( $post->ID, 'bilibili_url', true );
	$audio    = (string) get_post_meta( $post->ID, 'audio_url', true );
	$year     = (string) get_post_meta( $post->ID, 'work_year', true );
	?>
	<p>
		<label for="holt_bilibili_url"><strong><? esc_html_e( 'B 站 PV 链接', 'holt-portfolio' ); ?></strong></label><br>
		<input type="url" class="widefat" id="holt_bilibili_url" name="holt_bilibili_url"
			value="<?php echo esc_attr( $bilibili ); ?>"
			placeholder="https://www.bilibili.com/video/BV... 或 https://b23.tv/...">
	</p>
	<p>
		<label for="holt_audio_url"><strong><? esc_html_e( '音频链接（选填）', 'holt-portfolio' ); ?></strong></label><br>
		<input type="url" class="widefat" id="holt_audio_url" name="holt_audio_url"
			value="<?php echo esc_attr( $audio ); ?>"
			placeholder="<? esc_attr_e( '媒体库 MP3 或网易云/SoundCloud 外链', 'holt-portfolio' ); ?>">
	</p>
	<p>
		<label for="holt_work_year"><strong><? esc_html_e( '年份', 'holt-portfolio' ); ?></strong></label><br>
		<input type="text" class="widefat" id="holt_work_year" name="holt_work_year"
			value="<?php echo esc_attr( $year ); ?>" placeholder="<?php echo esc_attr( gmdate( 'Y' ) ); ?>">
	</p>
	<p class="description">
		<? esc_html_e( '角色请在右侧「参与角色」分类中选择。封面使用特色图片。', 'holt-portfolio' ); ?>
	</p>
	<?php
}

/**
 * Save meta box.
 *
 * @param int $post_id Post ID.
 */
function holt_save_work_meta( int $post_id ): void {
	if ( ! isset( $_POST['holt_work_meta_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['holt_work_meta_nonce'] ) ), 'holt_save_work_meta' ) ) {
		return;
	}

	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	if ( isset( $_POST['holt_bilibili_url'] ) ) {
		$url = esc_url_raw( wp_unslash( $_POST['holt_bilibili_url'] ) );
		update_post_meta( $post_id, 'bilibili_url', $url );
	}

	if ( isset( $_POST['holt_audio_url'] ) ) {
		$audio = esc_url_raw( wp_unslash( $_POST['holt_audio_url'] ) );
		update_post_meta( $post_id, 'audio_url', $audio );
	}

	if ( isset( $_POST['holt_work_year'] ) ) {
		$year = sanitize_text_field( wp_unslash( $_POST['holt_work_year'] ) );
		update_post_meta( $post_id, 'work_year', $year );
	}
}
add_action( 'save_post_work', 'holt_save_work_meta' );
