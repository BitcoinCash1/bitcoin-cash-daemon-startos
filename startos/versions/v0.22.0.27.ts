import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_22_0_27 = VersionInfo.of({
  version: '0.22.0:27',
  releaseNotes:
    'Native getblocktemplate fix (bchd mining.go): block templates are now built with the same consensus script flags as the mempool/consensus — adding ScriptAllowCashTokens (Upgrade9) and the May2025/May2026 flags above their activation. Previously NewBlockTemplate validated candidate txs with bare StandardVerifyFlags, so CashToken transactions (valid and already in the mempool) failed the template script check and were dropped, producing empty/near-empty blocks on token-active networks like chipnet. To be submitted upstream to gcash/bchd.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
