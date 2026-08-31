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
	$series  = holt_get_work_series( $post_id );
	$plays   = holt_get_work_play_count( $post_id );
	$owner   = holt_get_work_owner( $post_id );
	$credits = holt_parse_work_credits( $post_id );
	?>
	<article <?php post_class( 'holt-container holt-page holt-single-work' ); ?>>
		<header class="holt-single-work__head holt-reveal">
			<div class="holt-single-work__meta">
				<?php if ( $year !== '' ) : ?>
					<span class="tabular-nums"><?php echo esc_html( $year ); ?></span>
				<?php endif; ?>
				<?php if ( $series !== '' ) : ?>
					<span class="holt-pill"><?php echo esc_html( $series ); ?></span>
				<?php endif; ?>
				<?php if ( ! empty( $roles ) && ! is_wp_error( $roles ) ) : ?>
					<?php foreach ( $roles as $role ) : ?>
						<span class="holt-pill holt-pill--muted"><?php echo esc_html( $role->name ); ?></span>
					<?php endforeach; ?>
				<?php endif; ?>
				<?php if ( $owner !== '' ) : ?>
					<span class="holt-pill holt-pill--muted"><?php echo esc_html( sprintf( __( '投稿：%s', 'holt-portfolio' ), $owner ) ); ?></span>
				<?php endif; ?>
			</div>
			<h1 class="holt-page-title"><?php the_title(); ?></h1>
		</header>

		<div class="holt-single-work__layout">
			<div class="holt-reveal holt-reveal--delay-1">
				<?php if ( $bili['embed_url'] !== '' ) : ?>
					<div class="holt-player">
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
				<?php elseif ( has_post_thumbnail() ) : ?>
					<div class="holt-player__frame">
						<?php the_post_thumbnail( 'large', array( 'class' => 'holt-work-card__cover' ) ); ?>
					</div>
				<?php endif; ?>

				<?php if ( $plays > 0 ) : ?>
					<div class="holt-stats" aria-label="<? esc_attr_e( '数据', 'holt-portfolio' ); ?>">
						<div class="holt-stats__item">
							<span class="holt-stats__label"><? esc_html_e( '播放', 'holt-portfolio' ); ?></span>
							<span class="holt-stats__value tabular-nums"><?php echo esc_html( holt_format_play_count( $plays ) ); ?></span>
						</div>
						<div class="holt-stats__item">
							<span class="holt-stats__label"><? esc_html_e( '年份', 'holt-portfolio' ); ?></span>
							<span class="holt-stats__value tabular-nums"><?php echo esc_html( $year !== '' ? $year : '—' ); ?></span>
						</div>
						<div class="holt-stats__item">
							<span class="holt-stats__label"><? esc_html_e( '合集', 'holt-portfolio' ); ?></span>
							<span class="holt-stats__value"><?php echo esc_html( $series !== '' ? $series : '—' ); ?></span>
						</div>
					</div>
				<?php endif; ?>

				<?php if ( $audio !== '' ) : ?>
					<section class="holt-audio">
						<h2 class="holt-section__title"><? esc_html_e( '音频预览', 'holt-portfolio' ); ?></h2>
						<audio class="holt-audio__player" controls preload="none" src="<?php echo esc_url( $audio ); ?>">
							<? esc_html_e( '您的浏览器不支持音频播放。', 'holt-portfolio' ); ?>
						</audio>
					</section>
				<?php endif; ?>

				<?php if ( get_the_content() ) : ?>
					<div class="holt-prose holt-reveal holt-reveal--delay-2">
						<?php the_content(); ?>
					</div>
				<?php endif; ?>
			</div>

			<aside class="holt-panel holt-reveal holt-reveal--delay-2">
				<h2 class="holt-panel__title"><? esc_html_e( '职员表', 'holt-portfolio' ); ?></h2>
				<?php if ( $credits !== array() ) : ?>
					<ul class="holt-credits">
						<?php foreach ( $credits as $row ) : ?>
							<li class="holt-credits__row">
								<span class="holt-credits__role"><?php echo esc_html( $row['role'] ); ?></span>
								<span class="holt-credits__name"><?php echo esc_html( $row['name'] ); ?></span>
							</li>
						<?php endforeach; ?>
					</ul>
				<?php else : ?>
					<p class="holt-empty"><? esc_html_e( '简介中暂无结构化职员信息。', 'holt-portfolio' ); ?></p>
				<?php endif; ?>
			</aside>
		</div>

		<footer class="holt-single-work__footer">
			<a class="holt-text-link" href="<?php echo esc_url( holt_works_url() ); ?>">&larr; <? esc_html_e( '返回作品库', 'holt-portfolio' ); ?></a>
		</footer>
	</article>
	<?php
endwhile;

get_footer();
