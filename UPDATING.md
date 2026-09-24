# Updating the upstream version

This package takes **BCHD** (Go BCH full node) from the official image,
`ghcr.io/gcash/bchd:<tag>`, which upstream publishes for linux/amd64 and
linux/arm64 on every release. riscv64, which upstream does not publish, and
`gencerts` are compiled from the same tag in the `Dockerfile`.
Upstream releases live at [github.com/gcash/bchd](https://github.com/gcash/bchd/releases).

## Determining the upstream version

Check the latest tag on the [releases page](https://github.com/gcash/bchd/releases).
The current pin is `ARG BCHD_VERSION=` in `Dockerfile`.

## Applying the bump

The daily **Check Upstream** workflow does this automatically once the official
image for the new tag is published. By hand:

1. Check `ghcr.io/gcash/bchd:v<new version>` exists for amd64 and arm64
   (`docker manifest inspect`).
2. Update `ARG BCHD_VERSION=v<new version>` in `Dockerfile`.
3. Set `version` in `startos/versions/current.ts` to `<new version>:0` and rewrite
   `releaseNotes`.
4. Update version references in `README.md` and `instructions.md`.
5. Push to `master` — `tagAndRelease` builds and releases.
