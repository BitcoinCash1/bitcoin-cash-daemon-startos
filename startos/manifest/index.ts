import { setupManifest } from '@start9labs/start-sdk'
import { long, short, torDescription } from './i18n'

export const manifest = setupManifest({
  id: 'bchd',
  title: 'Bitcoin Cash Daemon',
  license: 'ISC',
  packageRepo:
    'https://github.com/Start9-Community/bitcoin-cash-daemon-startos',
  upstreamRepo: 'https://github.com/gcash/bchd',
  marketingUrl: 'https://bchd.cash',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    bchd: {
      source: { dockerBuild: {} },
      arch: ['x86_64', 'aarch64', 'riscv64'],
    },
  },
  dependencies: {
    tor: {
      description: torDescription,
      optional: true,
      metadata: {
        title: 'Tor',
        icon: 'https://raw.githubusercontent.com/Start9Labs/tor-startos/65faea17febc739d910e8c26ff4e61f6333487a8/icon.svg',
      },
    },
  },
})
