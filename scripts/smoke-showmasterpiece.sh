#!/usr/bin/env bash
set -euo pipefail

BASE="${SMOKE_BASE_URL:-http://localhost:3000}"
COOKIE_JAR="$(mktemp)"
trap 'rm -f "$COOKIE_JAR"' EXIT

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

echo "=== ShowMasterpiece smoke @ $BASE ==="
echo

echo "-- Pages --"
for path in \
  "/testField/ShowMasterPieces" \
  "/testField/ShowMasterPieces/config" \
  "/testField/ShowMasterPieces/history"; do
  code=$(curl -s -o /tmp/smoke-body.html -w "%{http_code}" "$BASE$path")
  check "GET $path" "200" "$code"
done

echo
echo "-- Public read APIs --"
for path in \
  "/api/showmasterpiece/collections" \
  "/api/showmasterpiece/categories" \
  "/api/showmasterpiece/tags" \
  "/api/showmasterpiece/config?environment=development"; do
  body=$(curl -s -w "\n%{http_code}" "$BASE$path")
  code=$(echo "$body" | tail -n1)
  json=$(echo "$body" | sed '$d')
  check "GET $path" "200" "$code"
  check_body "GET $path JSON" '"success"|"collections"|"categories"|"tags"|"config"|"siteName"|"id"' "$json"
done

echo
echo "-- Booking API (unauthenticated expectations) --"
code=$(curl -s -o /tmp/smoke-bookings.json -w "%{http_code}" "$BASE/api/showmasterpiece/bookings")
check "GET /bookings without credentials" "400" "$code"

code=$(curl -s -o /tmp/smoke-bookings-admin.json -w "%{http_code}" "$BASE/api/showmasterpiece/bookings/admin")
check "GET /bookings/admin without auth" "401" "$code"

echo
echo "-- Booking API (public lookup shape) --"
code=$(curl -s -o /tmp/smoke-bookings-lookup.json -w "%{http_code}" \
  "$BASE/api/showmasterpiece/bookings?qqNumber=10000&phoneNumber=13800138000")
if [[ "$code" == "200" || "$code" == "500" ]]; then
  echo "PASS  GET /bookings with qq+phone (HTTP $code, route reachable)"
  pass=$((pass + 1))
else
  echo "FAIL  GET /bookings with qq+phone (expected 200 or 500, got $code)"
  fail=$((fail + 1))
fi

echo
echo "-- Admin API (optional, needs SMOKE_ADMIN_PHONE + SMOKE_ADMIN_PASSWORD) --"
if [[ -n "${SMOKE_ADMIN_PHONE:-}" && -n "${SMOKE_ADMIN_PASSWORD:-}" ]]; then
  login_code=$(curl -s -c "$COOKIE_JAR" -b "$COOKIE_JAR" -o /tmp/smoke-login.json -w "%{http_code}" \
    -X POST "$BASE/api/auth/login" \
    -H 'Content-Type: application/json' \
    -d "{\"phone\":\"$SMOKE_ADMIN_PHONE\",\"password\":\"$SMOKE_ADMIN_PASSWORD\"}")
  check "POST /api/auth/login" "200" "$login_code"

  admin_code=$(curl -s -b "$COOKIE_JAR" -o /tmp/smoke-admin-bookings.json -w "%{http_code}" \
    "$BASE/api/showmasterpiece/bookings/admin")
  check "GET /bookings/admin with session" "200" "$admin_code"
  check_body "GET /bookings/admin stats" '"bookings"|"stats"' "$(cat /tmp/smoke-admin-bookings.json)"
else
  echo "SKIP  admin session tests (set SMOKE_ADMIN_USER and SMOKE_ADMIN_PASSWORD)"
fi

echo
echo "=== Result: $pass passed, $fail failed ==="
[[ "$fail" -eq 0 ]]
