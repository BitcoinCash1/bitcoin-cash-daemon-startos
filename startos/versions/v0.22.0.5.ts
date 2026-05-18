import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_22_0_5 = VersionInfo.of({
  version: '0.22.0:5',
  releaseNotes:
    'Fix health check stuck showing "Syncing" on a fully-synced node. ' +
    'BCHD omits mediantime via omitempty when synced; the previous code defaulted ' +
    'absent mediantime to Infinity, causing isStale=true forever. ' +
    'Absent mediantime is now treated as age=0 (not stale).',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
