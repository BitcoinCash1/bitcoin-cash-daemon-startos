import { VersionInfo } from '@start9labs/start-sdk'
import { bchdConf } from '../fileModels/bchd.conf'
import { storeJson } from '../fileModels/store.json'

export const v_0_22_0_19 = VersionInfo.of({
  version: '0.22.0:19',
  releaseNotes:
    'Fix migration for v0.22.0:18 settings. ' +
    'Resets the database cache to 450 MiB if it was the old stuck default of 2048 MiB, and disables Tor Stream Isolation if it was still set from the old default. ' +
    'After this update completes you can raise Database Cache and UTXO Cache to 2048 MiB each in Node Settings for faster IBD on machines with 8+ GB RAM.',
  migrations: {
    up: async ({ effects }) => {
      const conf = await bchdConf.read().once()
      if ((conf?.dbcachesize as number) === 2048) {
        await bchdConf.merge(effects, { dbcachesize: 450 })
      }
      const store = await storeJson.read().once()
      if (store?.torIsolation === true) {
        await storeJson.merge(effects, { torIsolation: false })
      }
    },
    down: async ({ effects }) => {},
  },
})
