<?php
/**
 * Generic page template.
 *
 * @package Holt_Portfolio
 */

get_header();
?>
<div class="holt-container holt-page holt-reveal">
	<?php while ( have_posts() ) : ?>
		<?php the_post(); ?>
		<h1 class="holt-page-title"><?php the_title(); ?></h1>
		<div class="holt-prose"><?php the_content(); ?></div>
	<?php endwhile; ?>
</div>
<?php
get_footer();
