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
    const fastSyncUsed = store?.fastSyncUsed ?? false
    return {
      // Locked to false when fastSyncUsed: early blocks were never downloaded.
      txindex: fastSyncUsed ? false : (conf?.txindex === 1 || conf?.txindex === true),
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
    const store = await storeJson.read().once()
    const fastSyncUsed = store?.fastSyncUsed ?? false

    // fastsync and txindex/addrindex are mutually exclusive — mirroring upstream
    // BCHD which hard-exits if both flags are set. fastSyncUsed means early blocks
    // were never downloaded; enabling txindex would crash BCHD at startup.
    const fastsync = input.fastsync
    const txindex = fastSyncUsed || fastsync || (input.prune && input.prune > 0)
      ? false
      : input.txindex

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

    if (fastSyncUsed && input.txindex) {
      return {
        version: '1' as const,
        title: 'Transaction Index Unavailable',
        message:
          'Transaction Index cannot be enabled because Fast Sync was used during initial sync. ' +
          'Pre-checkpoint blocks were never downloaded and cannot be indexed. ' +
          'To use txindex: run Maintenance → Delete Mainnet Data, then re-sync from genesis with Fast Sync disabled.',
        result: null,
      }
    }
    return null
  },
)
