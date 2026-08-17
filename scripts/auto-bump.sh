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

# Sanity-check the graph we just edited. auto-bump runs before `npm ci` in the
# workflow, so tsc usually is not installed yet — do not invoke npx here, it
# would fetch an arbitrary package or fail. Only type-check when a compiler is
# already present; otherwise fall back to a cheap textual duplicate check,
# which is the failure mode this script can actually cause.
if [ -x node_modules/.bin/tsc ]; then
  if ! node_modules/.bin/tsc --noEmit -p . >/dev/null 2>&1; then
    echo "auto-bump produced a version graph that does not type-check:" >&2
    node_modules/.bin/tsc --noEmit -p . 2>&1 | head -10 >&2
    exit 1
  fi
else
  dupes=$(grep -oE "^import \{ v_[0-9_]+ \}" startos/versions/index.ts | sort | uniq -d)
  if [ -n "$dupes" ]; then
    echo "auto-bump produced duplicate imports in startos/versions/index.ts:" >&2
    echo "$dupes" >&2
    exit 1
  fi
fi

# Never publish from a developer machine. This script ends in `git push`, so
# running it locally just to see what it would do pushes a real release commit
# to master. In CI, GITHUB_ACTIONS is always "true".
if [ -z "${GITHUB_ACTIONS:-}" ]; then
  echo "Not running in GitHub Actions — bump left uncommitted." >&2
  echo "Inspect with 'git diff', then commit manually if that is what you want." >&2
  exit 0
fi

# Pass the bot identity per-invocation. `git config user.name ...` without
# --global writes .git/config, which permanently rewrites the identity of
# whichever clone it runs in — every later commit in that clone is then
# misattributed to github-actions[bot].
git add startos/versions/index.ts "$NEW_FILE" Dockerfile.binary
git -c user.name="github-actions[bot]" \
    -c user.email="github-actions[bot]@users.noreply.github.com" \
    commit -m "feat: auto-bump to upstream ${DISPATCHED_TAG} (v${NEW_VERSION})"
git push origin master
echo "Version bump committed — continuing build"
