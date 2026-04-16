import { sdk } from '../sdk'
import { bchdConf, fullConfigSpec } from '../file-models/bchd.conf'
import { storeJson } from '../file-models/store.json'

export const configure = sdk.Action.withInput(
  'configure',

  async ({ effects }) => ({
    name: 'Configure',
    description: 'Configure BCHD settings',
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  fullConfigSpec,

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
    // Prune/txindex interlock: enabling pruning disables txindex
    const txindex = input.prune && input.prune > 0 ? false : input.txindex
    await bchdConf.merge(effects, {
      txindex: txindex ? 1 : 0,
      addrindex: txindex ? 1 : 0,
      grpclisten: input.grpcEnabled ? '0.0.0.0:8335' : '',
      nocfilters: input.cfindex ? 0 : 1,
      nopeerbloomfilters: input.peerbloomfilters ? 0 : 1,
      dbcachesize: input.dbcachesize,
      maxpeers: input.maxpeers,
    })
    await storeJson.merge(effects, {
      torEnabled: input.torEnabled,
      torIsolation: input.torIsolation,
      pruneDepth: input.prune && input.prune > 0 ? Math.max(input.prune, 288) : 0,
    })
    return null
  },
)
