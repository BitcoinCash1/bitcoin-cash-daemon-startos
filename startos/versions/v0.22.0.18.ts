import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_22_0_18 = VersionInfo.of({
  version: '0.22.0:18',
  releaseNotes:
    'Expose UTXO cache size as a configurable setting (default 1024 MiB, up from BCHD\'s hardcoded 450 MiB). ' +
    'The UTXO cache is the primary I/O bottleneck during IBD — raising it reduces UTXO disk I/O significantly on machines with 8+ GB RAM. ' +
    'Tor Stream Isolation now defaults to disabled: it caused aggressive peer churn (peers dropping in 8–13 seconds) during IBD, slowing sync. ' +
    'Re-enable it after the node is fully synced if stronger Tor privacy is desired.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
