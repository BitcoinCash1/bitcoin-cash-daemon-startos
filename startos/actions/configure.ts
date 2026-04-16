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
      prune: null,
      grpcEnabled: (conf?.grpclisten ?? '') !== '',
      dbcachesize: conf?.dbcachesize ?? 500,
      maxpeers: conf?.maxpeers ?? 125,
      peerbloomfilters: conf?.nopeerbloomfilters !== 1,
      torEnabled: store?.torEnabled ?? false,
      torIsolation: store?.torIsolation ?? false,
    }
  },

  async ({ effects, input }) => {
    await bchdConf.merge(effects, {
      grpclisten: input.grpcEnabled ? '0.0.0.0:8335' : '',
      nopeerbloomfilters: input.peerbloomfilters ? 0 : 1,
      dbcachesize: input.dbcachesize,
      maxpeers: input.maxpeers,
    })
    await storeJson.merge(effects, {
      torEnabled: input.torEnabled,
      torIsolation: input.torIsolation,
    })
    return null
  },
)
