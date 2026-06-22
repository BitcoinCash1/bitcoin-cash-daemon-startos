import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_22_0_20 = VersionInfo.of({
  version: '0.22.0:20',
  releaseNotes:
    'UTXO Cache is now editable from Node Settings without reinstalling. ' +
    'Previously it was only configurable at install time — now you can raise it to 2048 MiB on high-RAM machines directly from the Actions menu.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
