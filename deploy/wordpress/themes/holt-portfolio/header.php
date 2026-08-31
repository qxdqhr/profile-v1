<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="holt-skip-link" href="#main"><? esc_html_e( '跳到主要内容', 'holt-portfolio' ); ?></a>
<header class="holt-header">
	<div class="holt-container holt-header__inner">
		<a class="holt-logo" href="<?php echo esc_url( home_url( '/' ) ); ?>">
			<span class="holt-logo__mark" aria-hidden="true"></span>
			<span class="holt-logo__text"><?php echo esc_html( holt_artist_name() ); ?></span>
		</a>
		<nav class="holt-nav" aria-label="<? esc_attr_e( '主导航', 'holt-portfolio' ); ?>">
			<?php
			wp_nav_menu(
				array(
					'theme_location' => 'primary',
					'container'      => false,
					'fallback_cb'    => 'holt_fallback_menu',
					'menu_class'     => 'holt-nav__list',
					'depth'          => 1,
				)
			);
			?>
		</nav>
		<a class="holt-btn holt-btn--ghost holt-header__bili" href="<?php echo esc_url( holt_bilibili_space_url() ); ?>" target="_blank" rel="noopener noreferrer">
			<? esc_html_e( 'B 站主页', 'holt-portfolio' ); ?>
		</a>
	</div>
</header>
<main id="main" class="holt-main">
