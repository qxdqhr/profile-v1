#!/usr/bin/env bash
# 幂等创建 node_note_* 表（生产首次部署）
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/root/profile-v1}"
cd "$DEPLOY_DIR"

if [ ! -f .env ]; then
  echo "WARN: 无 .env，跳过 node-notes schema"
  exit 0
fi

if [ -x ./ensure-database-url.sh ]; then
  DB_URL="$(./ensure-database-url.sh)"
elif [ -f ./ensure-database-url.sh ]; then
  DB_URL="$(bash ./ensure-database-url.sh)"
else
  DB_URL="$(grep '^DATABASE_URL=' .env | tail -1 | cut -d= -f2- | tr -d '"')"
fi

HOST_DB_URL="${DB_URL/@host.docker.internal/@127.0.0.1}"

run_psql() {
  local sql="$1"
  if command -v psql >/dev/null 2>&1; then
    psql "$HOST_DB_URL" -v ON_ERROR_STOP=1 -c "$sql"
  else
    docker run --rm postgres:16-alpine psql "$HOST_DB_URL" -v ON_ERROR_STOP=1 -c "$sql"
  fi
}

echo "=== 确保 node_note_documents 表存在 ==="
run_psql "CREATE TABLE IF NOT EXISTS node_note_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES \"user\"(id) ON DELETE CASCADE,
  title varchar(100) NOT NULL,
  description text,
  slug varchar(120) NOT NULL,
  viewport text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);" || echo "WARN: node_note_documents 创建失败"

echo "=== 确保 node_note_nodes 表存在 ==="
run_psql "CREATE TABLE IF NOT EXISTS node_note_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES node_note_documents(id) ON DELETE CASCADE,
  title varchar(200) NOT NULL,
  content_md text NOT NULL DEFAULT '',
  position_x double precision NOT NULL DEFAULT 0,
  position_y double precision NOT NULL DEFAULT 0,
  width double precision NOT NULL DEFAULT 280,
  height double precision NOT NULL DEFAULT 160,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);" || echo "WARN: node_note_nodes 创建失败"

echo "=== 确保 node_note_edges 表存在 ==="
run_psql "CREATE TABLE IF NOT EXISTS node_note_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES node_note_documents(id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES node_note_nodes(id) ON DELETE CASCADE,
  target_id uuid NOT NULL REFERENCES node_note_nodes(id) ON DELETE CASCADE,
  label varchar(50),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT node_note_edges_no_self_loop CHECK (source_id <> target_id)
);" || echo "WARN: node_note_edges 创建失败"

run_psql "CREATE UNIQUE INDEX IF NOT EXISTS node_note_edges_doc_source_target_idx
  ON node_note_edges (document_id, source_id, target_id);" \
  || echo "WARN: node_note_edges 唯一索引创建失败"

echo "=== node-notes schema 检查完成 ==="
