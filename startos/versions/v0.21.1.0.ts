import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_21_1_0 = VersionInfo.of({
  version: '0.21.1:0',
  releaseNotes:
    'Initial release of BCHD for StartOS. Go-based Bitcoin Cash full node with gRPC API and BIP 157/158 compact block filters. Drop-in flavor replacement for BCHN.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
