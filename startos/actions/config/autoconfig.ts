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
      txindex: conf?.txindex === 1 || conf?.txindex === true,
      prune: 0,
      grpcEnabled: (conf?.grpclisten ?? '') !== '',
      cfindex: conf?.nocfilters !== 1,
      dbcachesize: conf?.dbcachesize ?? 500,
      maxpeers: conf?.maxpeers ?? 125,
      peerbloomfilters: conf?.nopeerbloomfilters !== 1,
      torEnabled: store?.torEnabled ?? false,
      torIsolation: store?.torIsolation ?? false,
    }
  },

  async ({ effects, input }) => {
    const { torEnabled, torIsolation, prune, txindex, grpcEnabled, cfindex, peerbloomfilters, dbcachesize, maxpeers } = input as any
    // Prune/txindex interlock
    const effectiveTxindex = prune && prune > 0 ? false : (txindex ?? true)
    await bchdConf.merge(effects, {
      txindex: effectiveTxindex ? 1 : 0,
      addrindex: effectiveTxindex ? 1 : 0,
      grpclisten: grpcEnabled ? '0.0.0.0:8335' : '',
      nocfilters: cfindex === false ? 1 : 0,
      nopeerbloomfilters: peerbloomfilters === false ? 1 : 0,
      dbcachesize: dbcachesize ?? 500,
      maxpeers: maxpeers ?? 125,
    })
    await storeJson.merge(effects, {
      torEnabled: torEnabled ?? false,
      torIsolation: torIsolation ?? false,
      pruneDepth: prune && prune > 0 ? Math.max(prune, 288) : 0,
    })
  },
)
