<?php
/**
 * Front page.
 *
 * @package Holt_Portfolio
 */

get_header();

$works = holt_query_featured_works( holt_featured_count() );
$total_works = (int) wp_count_posts( 'work' )->publish;
$series_n = count( holt_get_series_options() );
?>
<section class="holt-hero holt-reveal">
	<div class="holt-container holt-hero__inner">
		<div>
			<p class="holt-hero__eyebrow"><? esc_html_e( '音乐作品集', 'holt-portfolio' ); ?></p>
			<h1 class="holt-hero__title"><?php echo esc_html( holt_artist_name() ); ?></h1>
			<p class="holt-hero__tagline"><?php echo esc_html( holt_mod( 'tagline', '作曲 · 编曲 · 混音' ) ); ?></p>
			<div class="holt-hero__actions">
				<a class="holt-btn holt-btn--primary" href="<?php echo esc_url( holt_bilibili_space_url() ); ?>" target="_blank" rel="noopener noreferrer">
					<? esc_html_e( '在 B 站看我', 'holt-portfolio' ); ?>
				</a>
				<a class="holt-btn holt-btn--secondary" href="<?php echo esc_url( holt_works_url() ); ?>">
					<? esc_html_e( '浏览作品', 'holt-portfolio' ); ?>
				</a>
			</div>
		</div>
		<aside class="holt-hero__aside" aria-label="<? esc_attr_e( '作品概览', 'holt-portfolio' ); ?>">
			<div class="holt-hero__stat">
				<span class="holt-hero__stat-label"><? esc_html_e( '作品', 'holt-portfolio' ); ?></span>
				<span class="holt-hero__stat-value tabular-nums"><?php echo esc_html( (string) $total_works ); ?></span>
			</div>
			<div class="holt-hero__stat">
				<span class="holt-hero__stat-label"><? esc_html_e( '合集', 'holt-portfolio' ); ?></span>
				<span class="holt-hero__stat-value tabular-nums"><?php echo esc_html( (string) $series_n ); ?></span>
			</div>
			<div class="holt-hero__stat">
				<span class="holt-hero__stat-label"><? esc_html_e( '主阵地', 'holt-portfolio' ); ?></span>
				<span class="holt-hero__stat-value">Bilibili</span>
			</div>
		</aside>
	</div>
</section>

<section class="holt-section holt-reveal holt-reveal--delay-1">
	<div class="holt-container">
		<div class="holt-section__head">
			<h2 class="holt-section__title"><? esc_html_e( '热门作品', 'holt-portfolio' ); ?></h2>
			<a class="holt-text-link" href="<?php echo esc_url( holt_works_url() ); ?>"><? esc_html_e( '查看全部', 'holt-portfolio' ); ?></a>
		</div>
		<?php if ( $works->have_posts() ) : ?>
			<div class="holt-work-grid">
				<?php
				while ( $works->have_posts() ) :
					$works->the_post();
					get_template_part( 'template-parts/work', 'card' );
				endwhile;
				wp_reset_postdata();
				?>
			</div>
		<?php else : ?>
			<p class="holt-empty"><? esc_html_e( '后台添加「作品」后，这里会展示 B 站 PV 卡片。', 'holt-portfolio' ); ?></p>
		<?php endif; ?>
	</div>
</section>

<section class="holt-section holt-cta holt-reveal holt-reveal--delay-2">
	<div class="holt-container holt-cta__inner">
		<h2 class="holt-cta__title"><? esc_html_e( '合作与接单', 'holt-portfolio' ); ?></h2>
		<p class="holt-cta__text"><?php echo esc_html( holt_mod( 'contact_intro', '有编曲、混音或原创音乐需求？欢迎联系。' ) ); ?></p>
		<a class="holt-btn holt-btn--primary" href="<?php echo esc_url( home_url( '/contact/' ) ); ?>">
			<? esc_html_e( '联系我', 'holt-portfolio' ); ?>
		</a>
	</div>
</section>
<?php
get_footer();
