import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_22_2_2 = VersionInfo.of({
  version: '0.22.2:2',
  releaseNotes:
    'Report sync from `syncheight` (a field BCHD actually publishes) instead of ' +
    '`initialblockdownload` (always undefined → always Synced). runtimeInfo now ' +
    'uses the TLS cert instead of `--notls` (Start9-Community #9).',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
