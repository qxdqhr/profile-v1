<?php
/**
 * Contact page template.
 *
 * Template Name: 联系 Holt
 *
 * @package Holt_Portfolio
 */

get_header();

$email  = holt_mod( 'contact_email' );
$wechat = holt_mod( 'contact_wechat' );
?>
<div class="holt-container holt-page holt-contact holt-reveal">
	<h1 class="holt-page-title"><? esc_html_e( '联系与合作', 'holt-portfolio' ); ?></h1>
	<p class="holt-page-lead"><?php echo esc_html( holt_mod( 'contact_intro', '有编曲、混音或原创音乐需求？欢迎联系。' ) ); ?></p>

	<div class="holt-contact__grid">
		<?php if ( $email !== '' ) : ?>
			<div class="holt-contact__card">
				<h2><? esc_html_e( '邮箱', 'holt-portfolio' ); ?></h2>
				<a class="holt-contact__value" href="mailto:<?php echo esc_attr( $email ); ?>"><?php echo esc_html( $email ); ?></a>
			</div>
		<?php endif; ?>

		<?php if ( $wechat !== '' ) : ?>
			<div class="holt-contact__card">
				<h2><? esc_html_e( '微信', 'holt-portfolio' ); ?></h2>
				<p class="holt-contact__value tabular-nums"><?php echo esc_html( $wechat ); ?></p>
			</div>
		<?php endif; ?>

		<div class="holt-contact__card">
			<h2><? esc_html_e( 'B 站', 'holt-portfolio' ); ?></h2>
			<a class="holt-contact__value" href="<?php echo esc_url( holt_bilibili_space_url() ); ?>" target="_blank" rel="noopener noreferrer">
				<? esc_html_e( '个人空间', 'holt-portfolio' ); ?>
			</a>
		</div>
	</div>

	<div class="holt-prose">
		<?php
		while ( have_posts() ) :
			the_post();
			the_content();
		endwhile;
		?>
	</div>
</div>
<?php
get_footer();
