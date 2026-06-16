import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_22_0_14 = VersionInfo.of({
  version: '0.22.0:14',
  releaseNotes: 'Mimic upstream BCHD fastsync/txindex mutual exclusion: once Fast Sync is used, Transaction Index is permanently locked out for that data directory (upstream hard-exits if both flags are set). After sync completes, txindex shows as unavailable with a clear message. New Maintenance action: Delete Mainnet Data — deletes chain data and unlocks txindex so a fresh sync from genesis can build a complete index.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
