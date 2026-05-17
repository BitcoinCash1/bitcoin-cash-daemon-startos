import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_22_0_4 = VersionInfo.of({
  version: '0.22.0:4',
  releaseNotes:
    'Fix "Syncing blocks... 0.00% (951,444/951,444)" false sync indicator after restart. ' +
    'BCHD (Go) omits verificationprogress via omitempty when the node is fully synced. ' +
    'The previous fix defaulted undefined VP to 0, which triggered the vp < 0.999 ' +
    'syncing condition on every restart. VP is now only used when BCHD actually returns ' +
    'it. During real IBD, mediantime staleness still correctly detects the syncing state.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
