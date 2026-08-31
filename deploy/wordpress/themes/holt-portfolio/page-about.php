<?php
/**
 * About page template.
 *
 * Template Name: 关于 Holt
 *
 * @package Holt_Portfolio
 */

get_header();
?>
<div class="holt-container holt-page holt-about holt-reveal">
	<h1 class="holt-page-title"><? esc_html_e( '关于', 'holt-portfolio' ); ?> <?php echo esc_html( holt_artist_name() ); ?></h1>
	<p class="holt-page-lead"><?php echo esc_html( holt_mod( 'tagline', '作曲 · 编曲 · 混音' ) ); ?></p>
	<div class="holt-prose">
		<p><?php echo esc_html( holt_mod( 'about_bio', '独立音乐人，作品发布于 B 站。欢迎商业合作与编曲委托。' ) ); ?></p>
		<?php
		while ( have_posts() ) :
			the_post();
			the_content();
		endwhile;
		?>
	</div>
	<div class="holt-about__actions">
		<a class="holt-btn holt-btn--primary" href="<?php echo esc_url( holt_bilibili_space_url() ); ?>" target="_blank" rel="noopener noreferrer">
			<? esc_html_e( 'B 站主页', 'holt-portfolio' ); ?>
		</a>
		<a class="holt-btn holt-btn--secondary" href="<?php echo esc_url( home_url( '/contact/' ) ); ?>">
			<? esc_html_e( '联系合作', 'holt-portfolio' ); ?>
		</a>
	</div>
</div>
<?php
get_footer();
