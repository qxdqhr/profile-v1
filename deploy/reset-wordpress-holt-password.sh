#!/usr/bin/env bash
# 在网关服务器上重置 wordpress_holt 管理员密码（首个 administrator）。
# 用法（在 /root/profile-v1）：
#   NEW_PASSWORD='...' ./reset-wordpress-holt-password.sh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

NEW_PASSWORD="${NEW_PASSWORD:-}"
if [ -z "${NEW_PASSWORD}" ]; then
  echo "ERROR: 请设置 NEW_PASSWORD 环境变量" >&2
  exit 1
fi

COMPOSE=(docker compose -f docker-compose.gateway.yml)
SERVICE=wordpress_holt

if ! "${COMPOSE[@]}" ps --status running --services 2>/dev/null | grep -qx "${SERVICE}"; then
  echo "ERROR: 服务 ${SERVICE} 未运行" >&2
  "${COMPOSE[@]}" ps >&2 || true
  exit 1
fi

echo "=== 重置 ${SERVICE} 管理员密码 ==="
"${COMPOSE[@]}" exec -T -e NEW_PASSWORD="${NEW_PASSWORD}" "${SERVICE}" php <<'PHP'
<?php
require '/var/www/html/wp-load.php';
$pass = getenv('NEW_PASSWORD');
if ($pass === false || $pass === '') {
	fwrite(STDERR, "ERROR: NEW_PASSWORD empty\n");
	exit(1);
}
$users = get_users(
	array(
		'role'    => 'administrator',
		'orderby' => 'ID',
		'order'   => 'ASC',
		'number'  => 1,
		'fields'  => array( 'ID', 'user_login' ),
	)
);
if ( ! $users ) {
	fwrite( STDERR, "ERROR: no administrator user\n" );
	exit( 1 );
}
$user = $users[0];
wp_set_password( $pass, (int) $user->ID );
echo 'OK user_login=' . $user->user_login . ' ID=' . $user->ID . PHP_EOL;
PHP
