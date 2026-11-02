#!/bin/bash
# Repackages a pre-built Aura CLI release archive (see packages/opencode/script/build.ts)
# into a conda environment. No compilation happens here -- the archive already
# contains a finished, platform-specific `aura` binary plus its runtime assets
# (tree-sitter grammars, sandbox helpers, and on Linux, bwrap + licenses).
#
# `interpreter: bash` is forced in recipe.yaml, so this script always runs
# through bash on the build machine even when cross-building for a different
# target platform (e.g. building the win-64 package from a Linux CI runner).
set -euo pipefail

mkdir -p "$PREFIX/lib/aura"
cp -a "$SRC_DIR"/. "$PREFIX/lib/aura/"

if [ -f "$PREFIX/lib/aura/aura.exe" ]; then
  chmod +x "$PREFIX/lib/aura/aura.exe"
  mkdir -p "$PREFIX/Scripts"
  cat > "$PREFIX/Scripts/aura.bat" <<'BATCH'
@echo off
setlocal
set "AURA_TREE_SITTER_WASM_DIR=%~dp0..\lib\aura\tree-sitter"
"%~dp0..\lib\aura\aura.exe" %*
BATCH
else
  chmod +x "$PREFIX/lib/aura/aura"
  if [ -f "$PREFIX/lib/aura/bwrap" ]; then
    chmod +x "$PREFIX/lib/aura/bwrap"
  fi
  mkdir -p "$PREFIX/bin"
  cat > "$PREFIX/bin/aura" <<'SHELL'
#!/usr/bin/env bash
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export AURA_TREE_SITTER_WASM_DIR="$here/../lib/aura/tree-sitter"
exec "$here/../lib/aura/aura" "$@"
SHELL
  chmod +x "$PREFIX/bin/aura"
fi
