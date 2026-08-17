#!/usr/bin/env bash
set -euo pipefail

DISPATCHED_TAG="${1:-}"
if [ -z "$DISPATCHED_TAG" ]; then
  echo "Usage: $0 <tag>" >&2
  exit 1
fi

# gcash/bchd tags as v0.22.0 — strip leading 'v' for version file names
CLEAN_TAG="${DISPATCHED_TAG#v}"

CURRENT_VAR=$(grep -E '^[[:space:]]*current:' startos/versions/index.ts | head -1 \
  | sed -E 's/.*current:[[:space:]]*([A-Za-z0-9_]+).*/\1/')
VERSION_FILE_BASE=$(echo "$CURRENT_VAR" | sed -E 's/^v_//; s/_/./g')
CURRENT_VERSION=$(grep -E "version:[[:space:]]*'" "startos/versions/v${VERSION_FILE_BASE}.ts" \
  | head -1 | sed -E "s/.*version:[[:space:]]*'([^']+)'.*/\1/")
CURRENT_UPSTREAM="${CURRENT_VERSION%%:*}"

if [ "$CURRENT_UPSTREAM" = "$CLEAN_TAG" ]; then
  echo "Already at $CLEAN_TAG — no bump needed"
  exit 0
fi
echo "Bumping $CURRENT_UPSTREAM -> $CLEAN_TAG"

TAG_VAR="v_$(echo "$CLEAN_TAG" | tr '.' '_')_0"
NEW_VERSION="${CLEAN_TAG}:0"
NEW_FILE="startos/versions/v${CLEAN_TAG}.0.ts"

cat > "$NEW_FILE" <<EOF
import { VersionInfo } from '@start9labs/start-sdk'

export const ${TAG_VAR} = VersionInfo.of({
  version: '${NEW_VERSION}',
  releaseNotes: 'Upstream ${DISPATCHED_TAG}.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
EOF

# Both edits must be idempotent. Upstream tags do not always arrive in order,
# and a re-dispatch of the same tag re-runs this script — inserting the import
# or the `other` entry twice yields "TS2300: Duplicate identifier" and fails the
# package build. This is what broke bch-explorer-startos on 3.12.2/3.12.3.
if ! grep -q "import { ${TAG_VAR} } from" startos/versions/index.ts; then
  sed -i "1a import { ${TAG_VAR} } from './v${CLEAN_TAG}.0'" startos/versions/index.ts
fi

sed -i "s/current: ${CURRENT_VAR}/current: ${TAG_VAR}/" startos/versions/index.ts

# Demote the previous current into `other`, unless already listed there.
if ! grep -qE "(\[|[[:space:]])${CURRENT_VAR}," startos/versions/index.ts; then
  sed -i "s/other: \[/other: [${CURRENT_VAR}, /" startos/versions/index.ts
fi

# Fail here with a readable error rather than 30 minutes later in the package build.
if ! npx tsc --noEmit -p . >/dev/null 2>&1; then
  echo "auto-bump produced a version graph that does not type-check:" >&2
  npx tsc --noEmit -p . 2>&1 | head -10 >&2
  exit 1
fi

git config user.name "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"
git add startos/versions/index.ts "$NEW_FILE" Dockerfile.binary
git commit -m "feat: auto-bump to upstream ${DISPATCHED_TAG} (v${NEW_VERSION})"
git push origin master
echo "Version bump committed — continuing build"
