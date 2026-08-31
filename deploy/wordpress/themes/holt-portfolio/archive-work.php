<?php
/**
 * Work archive.
 *
 * @package Holt_Portfolio
 */

get_header();

$current_role = isset( $_GET['role'] ) ? sanitize_text_field( wp_unslash( $_GET['role'] ) ) : '';
$roles        = get_terms(
	array(
		'taxonomy'   => 'work_role',
		'hide_empty' => true,
	)
);
?>
<div class="holt-container holt-page">
	<header class="holt-page-head holt-reveal">
		<h1 class="holt-page-title"><? esc_html_e( '作品库', 'holt-portfolio' ); ?></h1>
		<p class="holt-page-lead"><? esc_html_e( '精选 B 站 PV 与参与项目，可按角色筛选。', 'holt-portfolio' ); ?></p>
	</header>

	<?php if ( ! empty( $roles ) && ! is_wp_error( $roles ) ) : ?>
		<nav class="holt-filter holt-reveal holt-reveal--delay-1" aria-label="<? esc_attr_e( '按角色筛选', 'holt-portfolio' ); ?>">
			<a class="holt-pill holt-pill--filter<?php echo $current_role === '' ? ' is-active' : ''; ?>" href="<?php echo esc_url( get_post_type_archive_link( 'work' ) ); ?>">
				<? esc_html_e( '全部', 'holt-portfolio' ); ?>
			</a>
			<?php foreach ( $roles as $role ) : ?>
				<a class="holt-pill holt-pill--filter<?php echo $current_role === $role->slug ? ' is-active' : ''; ?>"
					href="<?php echo esc_url( add_query_arg( 'role', $role->slug, get_post_type_archive_link( 'work' ) ) ); ?>">
					<?php echo esc_html( $role->name ); ?>
				</a>
			<?php endforeach; ?>
		</nav>
	<?php endif; ?>

	<?php
	$query_args = array(
		'post_type'      => 'work',
		'posts_per_page' => 24,
		'paged'          => max( 1, (int) get_query_var( 'paged' ) ),
	);
	if ( $current_role !== '' ) {
		$query_args['tax_query'] = array(
			array(
				'taxonomy' => 'work_role',
				'field'    => 'slug',
				'terms'    => $current_role,
			),
		);
	}
	$works = new WP_Query( $query_args );
	?>

	<?php if ( $works->have_posts() ) : ?>
		<div class="holt-work-grid holt-reveal holt-reveal--delay-2">
			<?php
			while ( $works->have_posts() ) :
				$works->the_post();
				get_template_part( 'template-parts/work', 'card' );
			endwhile;
			wp_reset_postdata();
			?>
		</div>
		<?php
		echo paginate_links(
			array(
				'total'   => $works->max_num_pages,
				'current' => max( 1, (int) get_query_var( 'paged' ) ),
				'type'    => 'list',
				'class'   => 'holt-pagination',
			)
		);
		?>
	<?php else : ?>
		<p class="holt-empty"><? esc_html_e( '暂无作品。', 'holt-portfolio' ); ?></p>
	<?php endif; ?>
</div>
<?php
get_footer();
