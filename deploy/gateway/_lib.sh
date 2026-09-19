#!/usr/bin/env bash
# 由 gateway/*.sh source：统一 DEPLOY_DIR（compose / nginx / games 所在根）与 GATEWAY_DIR（脚本目录）。
# shellcheck shell=bash
GATEWAY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="${DEPLOY_DIR:-$(cd "${GATEWAY_DIR}/.." && pwd)}"

gateway_sh() {
  local name="$1"
  shift
  bash "${GATEWAY_DIR}/${name}" "$@"
}
