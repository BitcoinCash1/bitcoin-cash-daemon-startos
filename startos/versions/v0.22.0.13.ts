import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_22_0_13 = VersionInfo.of({
  version: '0.22.0:13',
  releaseNotes: 'Auto-disable Fast Sync toggle once the node is fully synced. BCHD silently ignores --fastsync past checkpoint 661,648; the toggle now reflects that by turning itself off automatically after initial sync completes.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
