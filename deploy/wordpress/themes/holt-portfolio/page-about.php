<?php
/**
 * About page template.
 *
 * Template Name: 关于 Holt
 *
 * @package Holt_Portfolio
 */

get_header();

$skills = array( '作曲', '编曲', '混音', '演唱' );
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
	<div class="holt-skill-row" aria-label="<? esc_attr_e( '技能', 'holt-portfolio' ); ?>">
		<?php foreach ( $skills as $skill ) : ?>
			<span class="holt-pill"><?php echo esc_html( $skill ); ?></span>
		<?php endforeach; ?>
	</div>
	<p class="holt-page-lead">
		<? esc_html_e( '作品库同步自 B 站个人空间，含本人投稿与合作/合集收录；可用「仅 Holt」筛选本人作品。', 'holt-portfolio' ); ?>
	</p>
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
