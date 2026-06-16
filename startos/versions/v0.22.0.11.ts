import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_22_0_11 = VersionInfo.of({
  version: '0.22.0:11',
  releaseNotes: 'Add testnet4 network support (P2P 28333, RPC 28332, gRPC 28335). Select testnet4 from Network Settings. Testnet4 data can be cleared via the Delete Test Network Data maintenance action.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
