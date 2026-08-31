<?php
/**
 * Fallback navigation when no menu assigned.
 */
function holt_fallback_menu(): void {
	$items = array(
		array( 'label' => __( '首页', 'holt-portfolio' ), 'url' => home_url( '/' ) ),
		array( 'label' => __( '作品', 'holt-portfolio' ), 'url' => holt_works_url() ),
		array( 'label' => __( '关于', 'holt-portfolio' ), 'url' => home_url( '/about/' ) ),
		array( 'label' => __( '联系', 'holt-portfolio' ), 'url' => home_url( '/contact/' ) ),
	);

	echo '<ul class="holt-nav__list">';
	foreach ( $items as $item ) {
		printf(
			'<li><a class="holt-nav__link" href="%s">%s</a></li>',
			esc_url( $item['url'] ),
			esc_html( $item['label'] )
		);
	}
	echo '</ul>';
}
