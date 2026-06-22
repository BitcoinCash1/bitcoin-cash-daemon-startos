import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_22_0_22 = VersionInfo.of({
  version: '0.22.0:22',
  releaseNotes:
    'Consistency fix: the hidden Auto-Configure action now defaults Tor Stream ' +
    'Isolation to OFF, matching the node default (it had a stale ?? true fallback). ' +
    'No effect on normal installs — store.json always supplies the value — this ' +
    'only matters when another service auto-configures BCHD without specifying it.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
