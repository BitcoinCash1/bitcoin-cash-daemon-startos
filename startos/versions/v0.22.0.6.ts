import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_22_0_6 = VersionInfo.of({
  version: '0.22.0:6',
  releaseNotes: 'Show active network (Mainnet/Chipnet/etc.) in Blockchain Sync health check.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
