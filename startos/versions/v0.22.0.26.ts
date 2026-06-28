import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_22_0_26 = VersionInfo.of({
  version: '0.22.0:26',
  releaseNotes:
    'Mining/template policy: pass --blockprioritysize=0 so bchd builds block templates fee-first (no priority phase) — a sensible default for a mining-facing node. NOTE: this does NOT make bchd template DEEP unconfirmed transaction chains; bchd/btcd getblocktemplate still returns near-empty results on such a mempool where BCHN includes everything. Mining pools should use BCHN as the template source.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
