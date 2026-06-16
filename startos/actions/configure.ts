import { sdk } from '../sdk'
import { bchdConf, fullConfigSpec } from '../fileModels/bchd.conf'
import { storeJson } from '../fileModels/store.json'

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
    fastsync: true,
    prune: true,
    grpcEnabled: true,
    peerbloomfilters: true,
    cfindex: true,
    dbcachesize: true,
    dbflushinterval: true,
  }),

  async ({ effects }) => {
    const conf = await bchdConf.read().once()
    const store = await storeJson.read().once()
    return {
      txindex: conf?.txindex === 1 || conf?.txindex === true,
      fastsync: conf?.fastsync === 1 || conf?.fastsync === true,
      prune: store?.pruneDepth ?? 0,
      grpcEnabled: (conf?.grpclisten ?? '') !== '',
      peerbloomfilters: conf?.nopeerbloomfilters !== 1,
      cfindex: conf?.nocfilters !== 1,
      dbcachesize: conf?.dbcachesize ?? 2048,
      dbflushinterval: conf?.dbflushinterval ?? 1800,
    }
  },

  async ({ effects, input }) => {
    // fastsync and txindex/addrindex are mutually exclusive (BCHD upstream enforces this).
    // Prune also disables txindex. fastsync takes priority over txindex when both are set.
    const fastsync = input.fastsync
    const txindex = fastsync || (input.prune && input.prune > 0) ? false : input.txindex
    await bchdConf.merge(effects, {
      txindex: txindex ? 1 : 0,
      addrindex: txindex ? 1 : 0,
      fastsync: fastsync ? 1 : 0,
      grpclisten: input.grpcEnabled ? '0.0.0.0:8335' : '',
      nopeerbloomfilters: input.peerbloomfilters ? 0 : 1,
      nocfilters: input.cfindex ? 0 : 1,
      dbcachesize: input.dbcachesize,
      dbflushinterval: input.dbflushinterval,
    })
    await storeJson.merge(effects, {
      pruneDepth: input.prune && input.prune > 0 ? Math.max(input.prune, 288) : 0,
    })
    return null
  },
)
