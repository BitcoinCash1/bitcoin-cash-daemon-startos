import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_22_0_9 = VersionInfo.of({
  version: '0.22.0:9',
  releaseNotes: 'Tor now activates from first start, consistent with BCHN and Flowee. Removed IBD deferral and the auto-restart that was needed to enable it.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
