import { bchdConf, fullConfigSpec } from '../../file-models/bchd.conf'
import { storeJson } from '../../file-models/store.json'
import { sdk } from '../../sdk'

export const autoconfig = sdk.Action.withInput(
  'autoconfig',

  async ({ effects }) => ({
    name: 'Auto-Configure',
    description:
      'Automatically configure BCHD for the needs of another service',
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'hidden',
  }),

  async ({ effects, prefill }) => {
    if (!prefill) return fullConfigSpec

    return fullConfigSpec
      .filterFromPartial(prefill as typeof fullConfigSpec._PARTIAL)
      .disableFromPartial(
        prefill as typeof fullConfigSpec._PARTIAL,
        'These fields were provided by a task and cannot be edited',
      )
  },

  async ({ effects }) => {
    const conf = await bchdConf.read().once()
    const store = await storeJson.read().once()
    return {
      zmqEnabled: true,
      txindex: true,
      prune: null,
      grpcEnabled: (conf?.grpclisten ?? '') !== '',
      dbcachesize: conf?.dbcachesize ?? 500,
      maxpeers: conf?.maxpeers ?? 125,
      torEnabled: store?.torEnabled ?? false,
      torIsolation: store?.torIsolation ?? false,
    }
  },

  async ({ effects, input }) => {
    // Split: INI fields go to bchd.conf, Tor fields go to store.json
    const { torEnabled, torIsolation, zmqEnabled, txindex, prune, grpcEnabled, dbcachesize, maxpeers } = input as any
    await bchdConf.merge(effects, {
      grpclisten: grpcEnabled ? '0.0.0.0:8335' : '',
      dbcachesize: dbcachesize ?? 500,
      maxpeers: maxpeers ?? 125,
    })
    await storeJson.merge(effects, {
      torEnabled: torEnabled ?? false,
      torIsolation: torIsolation ?? false,
    })
  },
)
