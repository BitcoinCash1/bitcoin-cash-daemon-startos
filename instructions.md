# Bitcoin Cash Daemon (BCHD)

BCHD is a full node implementation of the Bitcoin Cash protocol written in Go.
It provides a JSON-RPC API, a gRPC API with pub/sub notifications, and BIP 157/158
compact block filters (Neutrino).

## Getting Started

After installation, BCHD will begin downloading and validating the BCH blockchain.
Initial Block Download (IBD) may take several hours.

## Configuration

All settings are available under **Config** in the StartOS service interface.

- **Network** — mainnet (default), testnet3, chipnet, or regtest
- **Transaction Index** — required by wallets and indexers that look up arbitrary txids
- **Block Explorer** — enable built-in block explorer (experimental)
- **Peers** — add or remove peer connections

## RPC Credentials

Use **Actions → Generate RPC Credential** to create credentials for wallet connections.
View existing credentials with **Actions → View RPC Credentials**.

## Ports

| Port  | Purpose                    |
|-------|----------------------------|
| 8332  | JSON-RPC (mainnet)         |
| 8333  | P2P (mainnet)              |
| 18332 | JSON-RPC (testnet3)        |
| 18333 | P2P (testnet3)             |
| 48332 | JSON-RPC (chipnet)         |
| 48333 | P2P (chipnet)              |
| 18443 | JSON-RPC (regtest)         |
| 18444 | P2P (regtest)              |
| 8335  | gRPC                       |

## Support

- Package: <https://github.com/BitcoinCash1/bitcoin-cash-daemon-startos>
- Upstream: <https://github.com/gcash/bchd>
