<p align="center">
  <img <img width="708" height="266" alt="image" src="https://github.com/user-attachments/assets/dda8918a-54a3-4be4-8f9b-df7f41651948" alt="BCHD Logo" width="21%">
</p>

# BCHD on StartOS

> **Upstream project:** <https://github.com/gcash/bchd>
>
> Everything not listed in this document should behave the same as upstream
> BCHD. If a feature, setting, or behavior is not mentioned here, the upstream
> documentation is accurate and fully applicable.

[BCHD](https://github.com/gcash/bchd) is a full node implementation of the Bitcoin Cash protocol written in Go. It features a modern gRPC API, BIP 157/158 compact block filters (Neutrino light client support), and a performance-oriented architecture.

**This package is a _flavor_ of Bitcoin Cash Node.** Installing BCHD replaces BCHN in-place — all dependent packages (Fulcrum BCH, BCH Explorer, mining pools) continue working without reconfiguration.

---

## Table of Contents

- [Flavor Concept](#flavor-concept)
- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [What BCHD Adds Over BCHN](#what-bchd-adds-over-bchn)
- [Limitations and Differences](#limitations-and-differences)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Flavor Concept

BCHD uses the **same package ID** (`bitcoin-cash-node`) as BCHN. In StartOS, this means:

- Installing BCHD **replaces** BCHN (and vice versa)
- All packages that depend on `bitcoin-cash-node` keep working
- The RPC interface (port 8332) and store.json format are identical
- You choose ONE node implementation — BCHD **or** BCHN, not both

**Why?** Both implementations serve the same purpose: they provide the BCH full node that Fulcrum, Explorer, and mining pools need. The flavor concept lets you choose your preferred implementation without breaking anything.

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

1. **If BCHN is installed**: BCHD will replace it. Blockchain data is NOT transferred — BCHD must sync from scratch.
2. Install BCHD from the StartOS marketplace
3. Wait for Initial Block Download (several hours depending on hardware)
4. All dependent packages (Fulcrum BCH, BCH Explorer, mining pools) reconnect automatically

**Install alert:** BCHD is a **flavor** of Bitcoin Cash Node. Installing BCHD will REPLACE Bitcoin Cash Node (BCHN).

## Configuration Management

BCHD is configured via `bchd.conf`, managed by StartOS. RPC credentials are stored in `store.json` and generated automatically on first install.

### User-Configurable Settings

From the **Actions** tab in StartOS, select **Configure** to adjust:

| Setting          | Default | Description                                      |
| ---------------- | ------- | ------------------------------------------------ |
| gRPC API         | On      | Enable gRPC on port 8335 (BIP 157/158, pub/sub)  |
| Database Cache   | 512 MB  | RAM allocated to UTXO database cache             |
| Max Peers        | 125     | Maximum peer connections                         |

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

## What BCHD Adds Over BCHN

| Feature             | BCHN     | BCHD          |
| ------------------- | -------- | ------------- |
| **gRPC API**        | No       | Yes (port 8335) |
| **BIP 157/158**     | No       | Yes (compact block filters) |
| **Language**        | C++      | Go            |
| **Address Index**   | Optional | Always on     |

## Limitations and Differences

1. **No ZMQ** — BCHD uses gRPC pub/sub instead of ZeroMQ for notifications. Dependent packages that hard-require ZMQ may need adaptation. The autoconfig accepts `zmqEnabled` for compatibility but it has no effect.
2. **No pruning** — BCHD always maintains the full blockchain
3. **Mainnet only** — This package is configured for BCH mainnet
4. **Separate sync** — If replacing BCHN, BCHD must sync from scratch (different database format)

## Contributing

Contributions are welcome. Please open an issue or pull request on the [GitHub repository](https://github.com/BitcoinCash1/bitcoin-cash-daemon-startos).

For build instructions, see the [Makefile](Makefile).

---

## Quick Reference for AI Consumers

```yaml
package_id: bitcoin-cash-node
flavor_of: BCHN (same package ID, drop-in replacement)
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
