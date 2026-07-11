import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_22_1_1 = VersionInfo.of({
  version: '0.22.1:1',
  releaseNotes:
    'Upstream bchd v0.22.1 — CashTokens GBT fix (gcash/bchd#651) merged upstream. ' +
    'Dropped local patch; upgrade9 template-size fix still carried.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
