import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_21_1_0 = VersionInfo.of({
  version: '0.21.1:0',
  releaseNotes:
    'Initial release of BCHD for StartOS. Go-based Bitcoin Cash full node with gRPC API, BIP 157/158 compact block filters (Neutrino), BIP 37 bloom filters, and full transaction index. Supports Tor for private peer connections.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
