<?php
/**
 * Work card partial.
 *
 * @package Holt_Portfolio
 */

$post_id = get_the_ID();
$bili    = holt_get_work_bilibili( $post_id );
$year    = holt_get_work_year( $post_id );
$roles   = get_the_terms( $post_id, 'work_role' );
$series  = holt_get_work_series( $post_id );
$plays   = holt_get_work_play_count( $post_id );
$owner   = holt_get_work_owner( $post_id );
$detail  = get_permalink();
?>
<article <?php post_class( 'holt-work-card' ); ?>>
	<div class="holt-work-card__frame">
		<a class="holt-work-card__media" href="<?php echo esc_url( $detail ); ?>">
			<?php if ( has_post_thumbnail() ) : ?>
				<?php the_post_thumbnail( 'holt-work-card', array( 'class' => 'holt-work-card__cover' ) ); ?>
			<?php else : ?>
				<div class="holt-work-card__placeholder" aria-hidden="true">
					<span><?php echo esc_html( $series !== '' ? $series : 'Holt' ); ?></span>
				</div>
			<?php endif; ?>
			<?php if ( $plays > 0 ) : ?>
				<span class="holt-work-card__plays tabular-nums"><?php echo esc_html( holt_format_play_count( $plays ) ); ?> 播放</span>
			<?php endif; ?>
		</a>
		<div class="holt-work-card__body">
			<div class="holt-work-card__meta">
				<?php if ( $year !== '' ) : ?>
					<span class="holt-work-card__year tabular-nums"><?php echo esc_html( $year ); ?></span>
				<?php endif; ?>
				<?php if ( $series !== '' ) : ?>
					<span class="holt-pill"><?php echo esc_html( $series ); ?></span>
				<?php endif; ?>
				<?php if ( ! empty( $roles ) && ! is_wp_error( $roles ) ) : ?>
					<?php foreach ( array_slice( $roles, 0, 2 ) as $role ) : ?>
						<span class="holt-pill holt-pill--muted"><?php echo esc_html( $role->name ); ?></span>
					<?php endforeach; ?>
				<?php endif; ?>
				<?php if ( $owner !== '' && ! holt_work_is_holt_owned( $post_id ) ) : ?>
					<span class="holt-pill holt-pill--muted"><?php echo esc_html( $owner ); ?></span>
				<?php endif; ?>
			</div>
			<h3 class="holt-work-card__title">
				<a href="<?php echo esc_url( $detail ); ?>"><?php the_title(); ?></a>
			</h3>
			<?php if ( has_excerpt() ) : ?>
				<p class="holt-work-card__excerpt"><?php echo esc_html( get_the_excerpt() ); ?></p>
			<?php endif; ?>
			<div class="holt-work-card__actions">
				<a class="holt-btn holt-btn--small holt-btn--secondary" href="<?php echo esc_url( $detail ); ?>">
					<? esc_html_e( '详情', 'holt-portfolio' ); ?>
				</a>
				<?php if ( $bili['bilibili_url'] !== '' ) : ?>
					<a class="holt-btn holt-btn--small holt-btn--ghost" href="<?php echo esc_url( $bili['bilibili_url'] ); ?>" target="_blank" rel="noopener noreferrer">
						<? esc_html_e( '看 PV', 'holt-portfolio' ); ?>
					</a>
				<?php endif; ?>
			</div>
		</div>
	</div>
</article>
