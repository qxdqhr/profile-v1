</main>
<footer class="holt-footer">
	<div class="holt-container holt-footer__inner">
		<p class="holt-footer__copy">
			&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?>
			<span class="tabular-nums"><?php echo esc_html( holt_artist_name() ); ?></span>
		</p>
		<a class="holt-footer__link" href="<?php echo esc_url( holt_bilibili_space_url() ); ?>" target="_blank" rel="noopener noreferrer">
			<? esc_html_e( 'B 站个人空间', 'holt-portfolio' ); ?>
		</a>
	</div>
</footer>
<?php wp_footer(); ?>
</body>
</html>
