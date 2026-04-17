import { sdk } from '../sdk'
import { bchdConf, fullConfigSpec } from '../file-models/bchd.conf'
import { storeJson } from '../file-models/store.json'

export const rpcPeersSettings = sdk.Action.withInput(
  'rpc-peers-settings',

  async ({ effects }) => ({
    name: 'RPC & Peers Settings',
    description: 'Configure peer connections, bloom filters, compact block filters, and Tor routing.',
    warning: null,
    allowedStatuses: 'any',
    group: 'Configuration',
    visibility: 'enabled',
  }),

  fullConfigSpec.filter({
    maxpeers: true,
    peerbloomfilters: true,
    cfindex: true,
    torEnabled: true,
    torIsolation: true,
  }),

  async ({ effects }) => {
    const conf = await bchdConf.read().once()
    const store = await storeJson.read().once()
    return {
      maxpeers: conf?.maxpeers ?? 125,
      peerbloomfilters: conf?.nopeerbloomfilters !== 1,
      cfindex: conf?.nocfilters !== 1,
      torEnabled: store?.torEnabled ?? true,
      torIsolation: store?.torIsolation ?? true,
    }
  },

  async ({ effects, input }) => {
    await bchdConf.merge(effects, {
      maxpeers: input.maxpeers,
      nopeerbloomfilters: input.peerbloomfilters ? 0 : 1,
      nocfilters: input.cfindex ? 0 : 1,
    })
    await storeJson.merge(effects, {
      torEnabled: input.torEnabled,
      torIsolation: input.torIsolation,
    })
    return null
  },
)
