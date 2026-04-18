<p align="center">
  <img src="icon.svg" alt="BCHD Logo" width="21%">
</p>

# Bitcoin Cash Daemon (BCHD) for StartOS

> **Upstream project:** <https://github.com/gcash/bchd>
>
> Everything not listed in this document should behave the same as upstream
> BCHD. If a feature, setting, or behavior is not mentioned here, the upstream
> documentation is accurate and fully applicable.

[BCHD](https://github.com/gcash/bchd) is a full node implementation of the Bitcoin Cash protocol written in Go. It features a modern gRPC API, BIP 157/158 compact block filters (Neutrino light client support), and a performance-oriented architecture.

**This is a standalone package** (`bitcoin-cash-daemon`) that runs alongside Bitcoin Cash Node (BCHN). Dependent packages (Fulcrum, Explorer, mining pools) can be configured to connect to either node.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [What BCHD Offers](#what-bchd-offers)
- [Limitations and Differences vs BCHN](#limitations-and-differences-vs-bchn)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

| Property      | Value                                          |
| ------------- | ---------------------------------------------- |
| BCHD          | Built from source (`gcash/bchd:v0.21.1`)      |
| Language      | Go                                             |
| Architectures | x86_64, aarch64                                |
| Runtime       | Single container, single daemon                |

## Volume and Data Layout

| Volume | Mount Point | Purpose                              |
| ------ | ----------- | ------------------------------------ |
| `main` | `/data`     | Blockchain data + configuration      |

StartOS-specific files:

| File         | Volume | Purpose                                 |
| ------------ | ------ | --------------------------------------- |
| `bchd.conf`  | `main` | BCHD configuration (managed by StartOS) |
| `store.json` | `main` | RPC credentials and state               |

## Installation and First-Run Flow

1. Install BCHD from the StartOS marketplace
2. Wait for Initial Block Download (several hours depending on hardware)
3. Configure dependent packages (Fulcrum, Explorer, mining pools) to connect to BCHD

For the fastest initial sync, keep Tor disabled until the chain is fully caught up. Enabling Tor and Tor isolation during IBD materially reduces peer throughput.

**Note:** BCHD runs as a separate package from BCHN. You can run both simultaneously if desired.

## Configuration Management

BCHD is configured via `bchd.conf`, managed by StartOS. RPC credentials are stored in `store.json` and generated automatically on first install.

### User-Configurable Settings

From the **Actions** tab in StartOS, select **Configure** to adjust:

| Setting          | Default | Description                                      |
| ---------------- | ------- | ------------------------------------------------ |
| gRPC API         | On      | Enable gRPC on port 8335 (BIP 157/158, pub/sub)  |
| Database Cache   | 2048 MB | RAM allocated to UTXO database cache             |
| Max Peers        | 125     | Maximum peer connections                         |
| Tor Routing      | Off     | Disabled by default for faster initial sync      |

### Always-On Features

| Feature          | Status      | Notes                                  |
| ---------------- | ----------- | -------------------------------------- |
| Transaction Index| Always on   | BCHD always maintains full tx index    |
| Address Index    | Always on   | BCHD always maintains address index    |
| BIP 157/158      | Always on   | Compact block filters (via gRPC)       |

### Auto-Configured by StartOS

| Setting       | Value                        | Purpose                    |
| ------------- | ---------------------------- | -------------------------- |
| `rpcuser`     | From `store.json`            | RPC authentication         |
| `rpcpass`     | From `store.json`            | RPC authentication         |
| `rpclisten`   | `0.0.0.0:8332`               | RPC port                   |
| `listen`      | `0.0.0.0:8333`               | P2P port                   |

## Network Access and Interfaces

| Interface  | Port  | Protocol   | Purpose                                     |
| ---------- | ----- | ---------- | ------------------------------------------- |
| RPC        | 8332  | HTTP/JSON-RPC | JSON-RPC commands (compatible with BCHN)  |
| P2P        | 8333  | TCP (raw)  | Peer-to-peer BCH network connections        |
| gRPC       | 8335  | HTTP/2     | Modern API, BIP 157/158 filters (optional)  |

## Backups and Restore

**Volumes backed up:** `main` — configuration and state

**Excluded from backup:** `/blocks`, `/chainstate`, `/peers.json` (re-synced after restore)

## Health Checks

| Check              | Method                 | Messages                                    |
| ------------------ | ---------------------- | ------------------------------------------- |
| **RPC**            | `bchctl getinfo`       | "BCHD RPC is ready" / "starting..."         |
| **Blockchain Sync**| `getblockchaininfo`    | "Synced — block N" / "Syncing... X%"        |
| **Peer Connections**| `getpeerinfo`         | "N peers (X outbound, Y inbound)"           |

## Dependencies

None. BCHD **is** the node layer.

## What BCHD Offers

| Feature             | BCHN     | BCHD          |
| ------------------- | -------- | ------------- |
| **gRPC API**        | No       | Yes (port 8335) |
| **BIP 157/158**     | No       | Yes (compact block filters) |
| **Language**        | C++      | Go            |
| **Address Index**   | Optional | Always on     |

## Limitations and Differences vs BCHN

1. **No ZMQ** — BCHD uses gRPC pub/sub instead of ZeroMQ for notifications. Dependent packages that hard-require ZMQ may need adaptation. The autoconfig accepts `zmqEnabled` for compatibility but it has no effect.
2. **Mainnet only** — This package is configured for BCH mainnet
3. **Separate sync** — If replacing BCHN, BCHD must sync from scratch (different database format)

## Contributing

Contributions are welcome. Please open an issue or pull request on the [GitHub repository](https://github.com/BitcoinCash1/bitcoin-cash-daemon-startos).

For build instructions, see the [Makefile](Makefile).

---

## Quick Reference for AI Consumers

```yaml
package_id: bitcoin-cash-daemon
standalone: true (separate from bitcoin-cash-node/BCHN)
upstream: gcash/bchd v0.21.1
language: Go
license: ISC
architectures: [x86_64, aarch64]
volumes:
  main: /data (blockchain + config)
ports:
  rpc: 8332 (JSON-RPC, compatible with BCHN)
  peer: 8333 (P2P)
  grpc: 8335 (gRPC, BIP 157/158 — optional)
dependencies: none (IS the node)
health_checks:
  - rpc: bchctl getinfo
  - sync-progress: getblockchaininfo
  - peer-connections: getpeerinfo
backup_strategy: volume rsync (main, excludes blocks/chainstate)
config_files:
  - /data/bchd.conf (managed by StartOS)
  - /data/store.json (RPC credentials)
extra_features:
  - BIP 157/158 compact block filters
  - gRPC API with pub/sub
  - Always-on txindex and addrindex
```
