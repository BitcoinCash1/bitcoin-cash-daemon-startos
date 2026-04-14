import { setupManifest } from '@start9labs/start-sdk'

export const manifest = setupManifest({
  id: 'bitcoin-cash-node',
  title: 'Bitcoin Cash Daemon',
  license: 'ISC',
  packageRepo: 'https://github.com/BitcoinCash1/bitcoin-cash-daemon-startos',
  upstreamRepo: 'https://github.com/gcash/bchd',
  marketingUrl: 'https://bchd.cash',
  donationUrl: null,
  docsUrls: [
    'https://github.com/BitcoinCash1/bitcoin-cash-daemon-startos/blob/master/README.md',
    'https://github.com/gcash/bchd',
  ],
  description: {
    short: 'Bitcoin Cash Daemon — Go-based BCH full node (BCHD)',
    long: 'Bitcoin Cash Daemon (BCHD) is an alternative full node implementation of the Bitcoin Cash protocol written in Go. It provides JSON-RPC, gRPC API, and BIP 157/158 compact block filters (Neutrino). This is a **flavor** of Bitcoin Cash Node — installing Bitcoin Cash Daemon replaces BCHN while all dependent packages (Fulcrum, Explorer, mining pools) keep working.',
  },
  volumes: ['main'],
  images: {
    bchd: {
      source: { dockerBuild: {} },
      arch: ['x86_64', 'aarch64'],
    },
  },
  alerts: {
    install:
      'Bitcoin Cash Daemon (BCHD) is a **flavor** of Bitcoin Cash Node. Installing Bitcoin Cash Daemon will REPLACE Bitcoin Cash Node (BCHN). All packages that depend on Bitcoin Cash Node (Fulcrum BCH, BCH Explorer, mining pools) will continue to work. Initial Block Download may take several hours.',
    update: null,
    uninstall:
      'Uninstalling Bitcoin Cash Daemon will permanently delete all blockchain data and configuration. You will need to install either BCHD or BCHN again and re-sync from scratch.',
    restore:
      'Restoring Bitcoin Cash Daemon will overwrite your current configuration. Blockchain data is not included in backups and must be re-synced.',
    start: null,
    stop: null,
  },
  dependencies: {},
})
