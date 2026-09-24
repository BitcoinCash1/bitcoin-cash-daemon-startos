# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

**Start every task at the recipe index** — `../start-technologies/projects/start-sdk/docs/src/recipes.md`
(or <https://docs.start9.com/packaging/recipes.html>). It maps an intent ("prompt the user to create
admin credentials", "expose a web UI") to the constructs, the reference pages, and a named production
package to copy. Find the recipe before you read this package's neighbours: a package you reach by
grepping may be non-conformant, and the recipe outranks it.

Freshly scaffolded? Work the
[New Package Checklist](../start-technologies/projects/start-sdk/docs/src/new-package-checklist.md)
(or <https://docs.start9.com/packaging/new-package-checklist.html>) from top to bottom. It is a
guide page, not a file in this repo — read it, don't copy it in.

Keep `README.md` (technical reference for an AI support or administering agent) and
`instructions.md` (end-user docs) in sync with your changes.

**Bugs and feature requests are GitHub issues on this repo** — file them as you find them.
Don't record work in the repo instead: no `TODO.md`, no `NOTES.md`, no `PLAN.md`. What you
verified, tried, and decided belongs in the commit message and the PR body.

## This repo

- **The packaging is derived from Bitcoin Core's.** `main.ts`, `interfaces.ts`, and `init/watchHosts.ts` mirror `start9-registry/bitcoin-core`; compare against that package when a construct here is unclear.
- **Don't declare the RPC or gRPC binds as `protocol: 'http'`.** BCHD terminates TLS itself on both, so an HTTP declaration makes the StartOS reverse proxy probe the backend every ~30s — endless `TLS handshake error … EOF` in the logs, and broken gRPC forwarding. Both are declared as pass-through TLS (`secure: { ssl: true }`, `protocol: null`).
- **Don't probe a TLS port by opening a socket.** The gRPC and stunnel checks read LISTEN state out of `/proc/1/net/tcp{,6}` precisely because `nc -z` and friends complete a TCP handshake and drop it, which the Go server logs as a failed TLS handshake on every poll.
- **INI values read back as strings.** `ini01` in `fileModels/bchd.conf.ts` coerces `"0"`/`"1"`/`"true"` to a numeric `0 | 1`; without it a `z.literal(0)` never matches and a flag cannot be turned off. Compare with `=== 1`, and keep new flags going through `ini01`.
- **Tor's SOCKS proxy is reached over the service bridge with a `9050` fallback.** Tor exports no interface, and the fallback holds the address constant while Tor is absent, so the `.const()` doesn't restart the node on Tor install/uninstall. A dead bridge address is just connection-refused, which is why the Tor flags are safe to pass unconditionally.
- **The stunnel sidecar is temporary by design.** It exists because ckpool-lineage miners (asicseer-pool, ckpool) have no TLS library. When upstream gains TLS, remove the daemon and the `rpc-plaintext` interface in one commit — the miner packages need no change.
- **`--rpcmaxclients=50` is deliberate.** BCHD defaults to 10, and the health checks plus a consumer can exceed that during sync while slow chain-locked calls are in flight, rejecting calls with "Max RPC clients exceeded".
- **`TARGETOS`/`TARGETARCH` are redeclared in the `Dockerfile` without defaults on purpose.** Giving a predefined build arg a default shadows what buildx injects, which would pin every target to one architecture.

## Repository conventions

This repo is the original the Start9-Community copy is imported from. Keep it a
near-replica of that copy: every difference must be one of those listed below.

- **Syncing with Start9-Community:** `git merge` their `master` into ours, never
  rebase or force-push. Take their side for packaging, layout, docs and CI;
  keep only the deliberate differences below.
- **Branches:** `master` is released — every push to it runs Tag and Release.
  Work happens on short-lived branches and reaches `master` through a PR.
  `next` is kept on purpose: Start9's Sync Next workflow mirrors `master` into
  it, so do not delete it.
- **Versions:** `<upstream>:<revision>` in the single `startos/versions/current.ts`.
  Never change the upstream part by hand; a new upstream starts at `:0` (the
  auto-bump PR does this). Bump the revision once per shipped package change —
  not for docs, CI or archive changes. `ALLOW_DOWNGRADE` stays `false` unless a
  release is known to be reversible.
- **`assets/` vs `archive/`:** `assets/` is packed into the s9pk as a whole. Here
  it holds Start9's files (`bchd-logo.svg`, used by the README, `icon.svg` and
  `instructions.md`); leave them as Start9 has them. `archive/` holds reference
  material (`ABOUT.md`, picture variants) and is not packed. Never delete
  anything in `archive/`.
- **What StartOS shows:** name from `title` in `startos/manifest/index.ts`,
  description and About text from `description.short`/`description.long` in
  `startos/manifest/index.ts`,
  Instructions tab from `instructions.md` (required), logo from `icon.png`.
- **Commit and PR hygiene:** no session links, `Co-Authored-By` trailers or
  "Generated with" footers in commit messages, PR descriptions or comments.
  The Session Link Guard workflow fails any PR or push that carries one.
  Commits are authored by the maintainer, and all repository text (code
  comments, docs, commit messages, PR text) is written in the maintainer's
  voice, without naming the tools used to produce it.
- **Deliberate differences from Start9-Community:** `--blockprioritysize=0` in `main.ts` (block templates filled by fee); `ALLOW_DOWNGRADE` in `current.ts`; `check-upstream.yml` + `scripts/auto-bump.sh` (daily upstream check, opens a bump PR); `dependabot.yml`; `session-link-guard.yml`; `archive/`; the matching README notes.
