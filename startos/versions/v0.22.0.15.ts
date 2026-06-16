import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_22_0_15 = VersionInfo.of({
  version: '0.22.0:15',
  releaseNotes: 'Remove broken Reindex Blockchain action: BCHD upstream has no --reindex flag (only --reindexchainstate). The action would have prevented BCHD from starting. Use Maintenance → Delete Mainnet Data for a full resync from genesis.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
