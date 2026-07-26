import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_22_2_0 = VersionInfo.of({
  version: '0.22.2:0',
  releaseNotes:
    'Upstream bchd v0.22.2. Includes a CashTokens consensus fix for minting-NFT ' +
    'forgery, a remotely triggerable crash in the committed filter handlers, and ' +
    'the BFUpgrade9 getblocktemplate flag (gcash/bchd 26be4302) that this package ' +
    'previously carried as a local patch. No local source patches remain — bchd is ' +
    'now built from unmodified upstream source.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
