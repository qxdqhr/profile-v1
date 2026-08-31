<?php
/**
 * Default index template.
 *
 * @package Holt_Portfolio
 */

get_header();
?>
<div class="holt-container holt-page">
	<?php if ( have_posts() ) : ?>
		<?php while ( have_posts() ) : ?>
			<?php the_post(); ?>
			<article <?php post_class( 'holt-prose' ); ?>>
				<h1 class="holt-page-title"><?php the_title(); ?></h1>
				<div class="holt-content"><?php the_content(); ?></div>
			</article>
		<?php endwhile; ?>
	<?php else : ?>
		<p><? esc_html_e( '暂无内容。', 'holt-portfolio' ); ?></p>
	<?php endif; ?>
</div>
<?php
get_footer();
