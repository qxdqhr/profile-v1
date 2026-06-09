#!/usr/bin/env bash
# 全站 universal-file API 冒烟（R2-506，扩展 smoke-showmasterpiece.sh）
set -euo pipefail

BASE="${SMOKE_BASE_URL:-http://localhost:3000}"
pass=0
fail=0

check() {
  local name="$1"
  local expect="$2"
  local actual="$3"
  if [[ "$actual" == "$expect" ]]; then
    echo "PASS  $name (HTTP $actual)"
    pass=$((pass + 1))
  else
    echo "FAIL  $name (expected $expect, got $actual)"
    fail=$((fail + 1))
  fi
}

check_body() {
  local name="$1"
  local pattern="$2"
  local body="$3"
  if echo "$body" | grep -qE "$pattern"; then
    echo "PASS  $name (body matches)"
    pass=$((pass + 1))
  else
    echo "FAIL  $name (body missing pattern: $pattern)"
    fail=$((fail + 1))
  fi
}

echo "=== universal-file API smoke @ $BASE ==="
echo

echo "-- Read routes --"
body=$(curl -s -w "\n%{http_code}" "$BASE/api/universal-file/stats")
code=$(echo "$body" | tail -n1)
json=$(echo "$body" | sed '$d')
if [[ "$code" == "200" || "$code" == "500" ]]; then
  echo "PASS  GET /api/universal-file/stats (HTTP $code, route reachable)"
  pass=$((pass + 1))
else
  echo "FAIL  GET /api/universal-file/stats (expected 200 or 500, got $code)"
  fail=$((fail + 1))
fi
if [[ "$code" == "200" ]]; then
  check_body "GET /stats JSON" '"totalFiles"|"success"' "$json"
fi

code=$(curl -s -o /tmp/smoke-file-missing.json -w "%{http_code}" \
  "$BASE/api/universal-file/00000000-0000-0000-0000-000000000000")
if [[ "$code" == "404" || "$code" == "500" ]]; then
  echo "PASS  GET /api/universal-file/[missing] (HTTP $code)"
  pass=$((pass + 1))
else
  echo "FAIL  GET /api/universal-file/[missing] (expected 404 or 500, got $code)"
  fail=$((fail + 1))
fi

echo
echo "-- Upload route (unauthenticated / empty body) --"
code=$(curl -s -o /tmp/smoke-upload.json -w "%{http_code}" \
  -X POST "$BASE/api/universal-file/upload")
if [[ "$code" == "400" || "$code" == "401" || "$code" == "500" ]]; then
  echo "PASS  POST /api/universal-file/upload without body (HTTP $code, route reachable)"
  pass=$((pass + 1))
else
  echo "FAIL  POST /upload (expected 400/401/500, got $code)"
  fail=$((fail + 1))
fi

echo
echo "-- Optional authenticated upload (SMOKE_UPLOAD_FILE) --"
if [[ -n "${SMOKE_UPLOAD_FILE:-}" && -f "${SMOKE_UPLOAD_FILE}" ]]; then
  COOKIE_JAR="$(mktemp)"
  trap 'rm -f "$COOKIE_JAR"' EXIT
  if [[ -n "${SMOKE_ADMIN_PHONE:-}" && -n "${SMOKE_ADMIN_PASSWORD:-}" ]]; then
    curl -s -c "$COOKIE_JAR" -b "$COOKIE_JAR" -o /dev/null \
      -X POST "$BASE/api/auth/login" \
      -H 'Content-Type: application/json' \
      -d "{\"phone\":\"$SMOKE_ADMIN_PHONE\",\"password\":\"$SMOKE_ADMIN_PASSWORD\"}"
  fi
  code=$(curl -s -b "${COOKIE_JAR:-}" -o /tmp/smoke-upload-ok.json -w "%{http_code}" \
    -X POST "$BASE/api/universal-file/upload" \
    -F "file=@${SMOKE_UPLOAD_FILE}" \
    -F "moduleId=smoke" \
    -F "businessId=default")
  if [[ "$code" == "200" ]]; then
    check "POST /upload with file" "200" "$code"
    check_body "upload response" '"fileId"|"accessUrl"|"success"' "$(cat /tmp/smoke-upload-ok.json)"
  else
    echo "FAIL  POST /upload with file (expected 200, got $code)"
    fail=$((fail + 1))
  fi
else
  echo "SKIP  authenticated upload (set SMOKE_UPLOAD_FILE + optional admin creds)"
fi

echo
echo "=== Result: $pass passed, $fail failed ==="
[[ "$fail" -eq 0 ]]
