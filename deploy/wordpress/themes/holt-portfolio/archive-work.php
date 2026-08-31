<?php
/**
 * Work archive.
 *
 * @package Holt_Portfolio
 */

get_header();

$ctx     = holt_get_archive_work_query();
$works   = $ctx['query'];
$roles   = get_terms(
	array(
		'taxonomy'   => 'work_role',
		'hide_empty' => true,
	)
);
$series_options = holt_get_series_options();
$year_options   = holt_get_year_options();
?>
<div class="holt-container holt-page">
	<header class="holt-page-head holt-reveal">
		<h1 class="holt-page-title"><? esc_html_e( '作品库', 'holt-portfolio' ); ?></h1>
		<p class="holt-page-lead"><? esc_html_e( '按合集、角色、年份筛选；也可只看 Holt 本人投稿。', 'holt-portfolio' ); ?></p>
	</header>

	<div class="holt-filter-group holt-reveal holt-reveal--delay-1">
		<span class="holt-filter-group__label"><? esc_html_e( '范围', 'holt-portfolio' ); ?></span>
		<nav class="holt-filter" aria-label="<? esc_attr_e( '投稿范围', 'holt-portfolio' ); ?>">
			<a class="holt-pill holt-pill--filter<?php echo ! $ctx['mine'] ? ' is-active' : ''; ?>" href="<?php echo esc_url( holt_works_filter_url( array( 'mine' => false ) ) ); ?>">
				<? esc_html_e( '全部', 'holt-portfolio' ); ?>
			</a>
			<a class="holt-pill holt-pill--filter<?php echo $ctx['mine'] ? ' is-active' : ''; ?>" href="<?php echo esc_url( holt_works_filter_url( array( 'mine' => true ) ) ); ?>">
				<? esc_html_e( '仅 Holt', 'holt-portfolio' ); ?>
			</a>
		</nav>
	</div>

	<?php if ( ! empty( $series_options ) ) : ?>
		<div class="holt-filter-group holt-reveal holt-reveal--delay-1">
			<span class="holt-filter-group__label"><? esc_html_e( '合集', 'holt-portfolio' ); ?></span>
			<nav class="holt-filter" aria-label="<? esc_attr_e( '按合集筛选', 'holt-portfolio' ); ?>">
				<a class="holt-pill holt-pill--filter<?php echo $ctx['series'] === '' ? ' is-active' : ''; ?>" href="<?php echo esc_url( holt_works_filter_url( array( 'series' => '' ) ) ); ?>">
					<? esc_html_e( '全部合集', 'holt-portfolio' ); ?>
				</a>
				<?php foreach ( $series_options as $series_name ) : ?>
					<a class="holt-pill holt-pill--filter<?php echo $ctx['series'] === $series_name ? ' is-active' : ''; ?>"
						href="<?php echo esc_url( holt_works_filter_url( array( 'series' => $series_name ) ) ); ?>">
						<?php echo esc_html( $series_name ); ?>
					</a>
				<?php endforeach; ?>
			</nav>
		</div>
	<?php endif; ?>

	<?php if ( ! empty( $roles ) && ! is_wp_error( $roles ) ) : ?>
		<div class="holt-filter-group holt-reveal holt-reveal--delay-1">
			<span class="holt-filter-group__label"><? esc_html_e( '角色', 'holt-portfolio' ); ?></span>
			<nav class="holt-filter" aria-label="<? esc_attr_e( '按角色筛选', 'holt-portfolio' ); ?>">
				<a class="holt-pill holt-pill--filter<?php echo $ctx['role'] === '' ? ' is-active' : ''; ?>" href="<?php echo esc_url( holt_works_filter_url( array( 'role' => '' ) ) ); ?>">
					<? esc_html_e( '全部角色', 'holt-portfolio' ); ?>
				</a>
				<?php foreach ( $roles as $role ) : ?>
					<a class="holt-pill holt-pill--filter<?php echo $ctx['role'] === $role->slug ? ' is-active' : ''; ?>"
						href="<?php echo esc_url( holt_works_filter_url( array( 'role' => $role->slug ) ) ); ?>">
						<?php echo esc_html( $role->name ); ?>
					</a>
				<?php endforeach; ?>
			</nav>
		</div>
	<?php endif; ?>

	<?php if ( ! empty( $year_options ) ) : ?>
		<div class="holt-filter-group holt-reveal holt-reveal--delay-1">
			<span class="holt-filter-group__label"><? esc_html_e( '年份', 'holt-portfolio' ); ?></span>
			<nav class="holt-filter" aria-label="<? esc_attr_e( '按年份筛选', 'holt-portfolio' ); ?>">
				<a class="holt-pill holt-pill--filter<?php echo $ctx['year'] === '' ? ' is-active' : ''; ?>" href="<?php echo esc_url( holt_works_filter_url( array( 'year' => '' ) ) ); ?>">
					<? esc_html_e( '全部年份', 'holt-portfolio' ); ?>
				</a>
				<?php foreach ( $year_options as $year ) : ?>
					<a class="holt-pill holt-pill--filter<?php echo $ctx['year'] === $year ? ' is-active' : ''; ?>"
						href="<?php echo esc_url( holt_works_filter_url( array( 'year' => $year ) ) ); ?>">
						<span class="tabular-nums"><?php echo esc_html( $year ); ?></span>
					</a>
				<?php endforeach; ?>
			</nav>
		</div>
	<?php endif; ?>

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
		<div class="holt-pagination">
			<?php
			echo paginate_links(
				array(
					'total'     => $works->max_num_pages,
					'current'   => max( 1, (int) get_query_var( 'paged' ) ),
					'type'      => 'list',
					'add_args'  => array_filter(
						array(
							'role'   => $ctx['role'],
							'series' => $ctx['series'],
							'year'   => $ctx['year'],
							'mine'   => $ctx['mine'] ? '1' : '',
						)
					),
				)
			);
			?>
		</div>
	<?php else : ?>
		<p class="holt-empty"><? esc_html_e( '当前筛选下暂无作品。', 'holt-portfolio' ); ?></p>
	<?php endif; ?>
</div>
<?php
get_footer();
