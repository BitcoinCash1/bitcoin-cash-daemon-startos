import { sdk } from '../sdk'
import { bchdConf, fullConfigSpec } from '../file-models/bchd.conf'

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
    return {
      zmqEnabled: true,
      txindex: true,
      prune: null,
      grpcEnabled: (conf?.grpclisten ?? '') !== '',
      dbcachesize: conf?.dbcachesize ?? 500,
      maxpeers: conf?.maxpeers ?? 125,
    }
  },

  async ({ effects, input }) => {
    await bchdConf.merge(effects, {
      grpclisten: input.grpcEnabled ? '0.0.0.0:8335' : '',
      dbcachesize: input.dbcachesize,
      maxpeers: input.maxpeers,
    })
    return null
  },
)
