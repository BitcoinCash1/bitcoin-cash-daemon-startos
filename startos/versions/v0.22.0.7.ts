import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_22_0_7 = VersionInfo.of({
  version: '0.22.0:7',
  releaseNotes: 'Fix health check flicker: retry RPC up to 3 times (2s apart) before reporting loading. Prevents spurious "Waiting for sync info" / "Unable to query peers" during transient BCHD RPC unavailability (cache flush, block processing).',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
