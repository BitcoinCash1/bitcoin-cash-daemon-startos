import { sdk } from '../sdk'
import { bchdConf, fullConfigSpec } from '../file-models/bchd.conf'
import { storeJson } from '../file-models/store.json'

export const nodeSettings = sdk.Action.withInput(
  'node-settings',

  async ({ effects }) => ({
    name: 'Node Settings',
    description: 'Indexes, pruning, gRPC API, and database performance.',
    warning: null,
    allowedStatuses: 'any',
    group: 'Configuration',
    visibility: 'enabled',
  }),

  fullConfigSpec.filter({
    txindex: true,
    prune: true,
    grpcEnabled: true,
    dbcachesize: true,
    dbflushinterval: true,
  }),

  async ({ effects }) => {
    const conf = await bchdConf.read().once()
    const store = await storeJson.read().once()
    return {
      txindex: conf?.txindex === 1 || conf?.txindex === true,
      prune: store?.pruneDepth ?? 0,
      grpcEnabled: (conf?.grpclisten ?? '') !== '',
      dbcachesize: conf?.dbcachesize ?? 2048,
      dbflushinterval: conf?.dbflushinterval ?? 1800,
    }
  },

  async ({ effects, input }) => {
    const txindex = input.prune && input.prune > 0 ? false : input.txindex
    await bchdConf.merge(effects, {
      txindex: txindex ? 1 : 0,
      addrindex: txindex ? 1 : 0,
      grpclisten: input.grpcEnabled ? '0.0.0.0:8335' : '',
      dbcachesize: input.dbcachesize,
      dbflushinterval: input.dbflushinterval,
    })
    await storeJson.merge(effects, {
      pruneDepth: input.prune && input.prune > 0 ? Math.max(input.prune, 288) : 0,
    })
    return null
  },
)
