import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_22_0_8 = VersionInfo.of({
  version: '0.22.0:8',
  releaseNotes: 'Fix Tor activation after first sync: BCHD now restarts automatically once the initial block download completes so Tor proxy is enabled without requiring a manual restart.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
