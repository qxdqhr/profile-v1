<?php
/**
 * Single work.
 *
 * @package Holt_Portfolio
 */

get_header();

while ( have_posts() ) :
	the_post();
	$post_id = get_the_ID();
	$bili    = holt_get_work_bilibili( $post_id );
	$audio   = holt_get_work_audio_url( $post_id );
	$year    = holt_get_work_year( $post_id );
	$roles   = get_the_terms( $post_id, 'work_role' );
	?>
	<article <?php post_class( 'holt-container holt-page holt-single-work' ); ?>>
		<header class="holt-single-work__head holt-reveal">
			<div class="holt-single-work__meta">
				<?php if ( $year !== '' ) : ?>
					<span class="tabular-nums"><?php echo esc_html( $year ); ?></span>
				<?php endif; ?>
				<?php if ( ! empty( $roles ) && ! is_wp_error( $roles ) ) : ?>
					<?php foreach ( $roles as $role ) : ?>
						<span class="holt-pill"><?php echo esc_html( $role->name ); ?></span>
					<?php endforeach; ?>
				<?php endif; ?>
			</div>
			<h1 class="holt-page-title"><?php the_title(); ?></h1>
			<?php if ( has_excerpt() ) : ?>
				<p class="holt-page-lead"><?php echo esc_html( get_the_excerpt() ); ?></p>
			<?php endif; ?>
		</header>

		<?php if ( $bili['embed_url'] !== '' ) : ?>
			<div class="holt-player holt-reveal holt-reveal--delay-1">
				<div class="holt-player__frame">
					<iframe
						src="<?php echo esc_url( $bili['embed_url'] ); ?>"
						title="<?php echo esc_attr( get_the_title() ); ?>"
						allowfullscreen
						loading="lazy"
						referrerpolicy="no-referrer-when-downgrade"
					></iframe>
				</div>
				<?php if ( $bili['bilibili_url'] !== '' ) : ?>
					<a class="holt-btn holt-btn--ghost" href="<?php echo esc_url( $bili['bilibili_url'] ); ?>" target="_blank" rel="noopener noreferrer">
						<? esc_html_e( '在 B 站打开', 'holt-portfolio' ); ?>
					</a>
				<?php endif; ?>
			</div>
		<?php endif; ?>

		<?php if ( $audio !== '' ) : ?>
			<section class="holt-audio holt-reveal holt-reveal--delay-2">
				<h2 class="holt-section__title"><? esc_html_e( '音频预览', 'holt-portfolio' ); ?></h2>
				<audio class="holt-audio__player" controls preload="none" src="<?php echo esc_url( $audio ); ?>">
					<? esc_html_e( '您的浏览器不支持音频播放。', 'holt-portfolio' ); ?>
				</audio>
			</section>
		<?php endif; ?>

		<?php if ( get_the_content() ) : ?>
			<div class="holt-prose holt-reveal holt-reveal--delay-3">
				<?php the_content(); ?>
			</div>
		<?php endif; ?>

		<footer class="holt-single-work__footer">
			<a class="holt-text-link" href="<?php echo esc_url( holt_works_url() ); ?>">&larr; <? esc_html_e( '返回作品库', 'holt-portfolio' ); ?></a>
		</footer>
	</article>
	<?php
endwhile;

get_footer();
