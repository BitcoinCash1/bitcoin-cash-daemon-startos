import { setupManifest } from '@start9labs/start-sdk'

export const manifest = setupManifest({
  id: 'bitcoin-cash-daemon',
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
    long: 'Bitcoin Cash Daemon (BCHD) is an alternative full node implementation of the Bitcoin Cash protocol written in Go. It provides JSON-RPC, gRPC API, and BIP 157/158 compact block filters (Neutrino). Can run alongside BCHN — dependent packages choose which node to use.',
  },
  volumes: ['main'],
  images: {
    bchd: {
      source: { dockerBuild: {} },
      arch: ['x86_64', 'aarch64'],
      emulateMissingAs: 'x86_64',
    },
  },
  alerts: {
    install:
      'Bitcoin Cash Daemon (BCHD) is a Go-based BCH full node. It can run alongside BCHN — they are separate packages. Dependent packages (Fulcrum, Explorer, mining pools) can be configured to use either node. Initial Block Download may take several hours.',
    update: null,
    uninstall:
      'Uninstalling will delete all blockchain data and configuration. A fresh sync will be required if you reinstall.',
    restore:
      'Restoring will overwrite current configuration. Blockchain data is not included in backups and will be re-synced automatically.',
    start: null,
    stop: null,
  },
  dependencies: {
    tor: {
      description:
        'Enables Tor onion routing for anonymous peer-to-peer connections. When Tor is installed and running, BCHD automatically routes all connections through the Tor network for enhanced privacy.',
      optional: true,
      metadata: {
        title: 'Tor',
        icon: 'https://raw.githubusercontent.com/Start9Labs/tor-startos/65faea17febc739d910e8c26ff4e61f6333487a8/icon.svg',
      },
    },
  },
})
