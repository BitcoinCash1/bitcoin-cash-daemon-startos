#!/usr/bin/env bash
set -euo pipefail

TAG="${1:-${GITHUB_REF_NAME:-}}"
if [ -z "$TAG" ]; then
  echo "Usage: $0 <tag>" >&2
  exit 1
fi
CLEAN_TAG="${TAG#v}"

# Bump version files if needed
CURRENT_VAR=$(grep -E '^[[:space:]]*current:' startos/versions/index.ts | head -1 \
  | sed -E 's/.*current:[[:space:]]*([A-Za-z0-9_]+).*/\1/')
VERSION_FILE_BASE=$(echo "$CURRENT_VAR" | sed -E 's/^v_//; s/_/./g')
CURRENT_VERSION=$(grep -E "version:[[:space:]]*'" "startos/versions/v${VERSION_FILE_BASE}.ts" \
  | head -1 | sed -E "s/.*version:[[:space:]]*'([^']+)'.*/\1/")
CURRENT_UPSTREAM="${CURRENT_VERSION%%:*}"

if [ "$CURRENT_UPSTREAM" = "$CLEAN_TAG" ]; then
  echo "Package already at $CLEAN_TAG — building as-is"
else
  echo "Bumping $CURRENT_UPSTREAM -> $CLEAN_TAG"

  TAG_VAR="v_$(echo "$CLEAN_TAG" | tr '.' '_')_0"
  NEW_VERSION="${CLEAN_TAG}:0"
  NEW_FILE="startos/versions/v${CLEAN_TAG}.0.ts"

  echo "import { VersionInfo } from '@start9labs/start-sdk'" > "$NEW_FILE"
  echo "" >> "$NEW_FILE"
  echo "export const ${TAG_VAR} = VersionInfo.of({" >> "$NEW_FILE"
  echo "  version: '${NEW_VERSION}'," >> "$NEW_FILE"
  echo "  releaseNotes: 'Upstream ${TAG}.'," >> "$NEW_FILE"
  echo "  migrations: {" >> "$NEW_FILE"
  echo "    up: async ({ effects }) => {}," >> "$NEW_FILE"
  echo "    down: async ({ effects }) => {}," >> "$NEW_FILE"
  echo "  }," >> "$NEW_FILE"
  echo "})" >> "$NEW_FILE"

  sed -i "s|ARG BCHD_VERSION=v[0-9][0-9.]*|ARG BCHD_VERSION=${TAG}|" Dockerfile
  sed -i "1a import { ${TAG_VAR} } from './${CLEAN_TAG}.0'" startos/versions/index.ts
  sed -i "s/current: ${CURRENT_VAR}/current: ${TAG_VAR}/" startos/versions/index.ts
  sed -i "s/other: \[/other: [${CURRENT_VAR}, /" startos/versions/index.ts
fi

# Build
RUST_LOG=debug RUST_BACKTRACE=1 make
echo ""
echo "SHA256SUMs:"
sha256sum ./*.s9pk
