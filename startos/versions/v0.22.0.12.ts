import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_22_0_12 = VersionInfo.of({
  version: '0.22.0:12',
  releaseNotes: 'Add Fast Sync option to Node Settings. Enabling Fast Sync skips block validation before checkpoint 661,648 by downloading a pre-computed UTXO snapshot, dramatically reducing initial sync time. Incompatible with Transaction Index — enabling Fast Sync automatically disables txindex and addrindex.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
