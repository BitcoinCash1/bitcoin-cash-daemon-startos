import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_22_0_17 = VersionInfo.of({
  version: '0.22.0:17',
  releaseNotes:
    'Enforce the 450 MiB database cache limit at startup. ' +
    'The prior build (v0.22.0:16) corrected the default but could not update existing config files during migration. ' +
    'This build adds a runtime override: if bchd.conf still contains the old 2048 MiB default, BCHD is launched with 450 MiB instead. No manual action required.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
