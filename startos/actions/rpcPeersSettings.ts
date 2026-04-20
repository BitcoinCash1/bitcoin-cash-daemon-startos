import { sdk } from '../sdk'
import { ALL_ONLYNETS, bchdConf, fullConfigSpec, OnlynetKey } from '../file-models/bchd.conf'
import { storeJson } from '../file-models/store.json'

export const rpcPeersSettings = sdk.Action.withInput(
  'rpc-peers-settings',

  async ({ effects }: { effects: any }) => ({
    name: 'RPC & Peers Settings',
    description: 'Configure peer connections, bloom filters, compact block filters, and Tor proxy behavior.',
    warning: null,
    allowedStatuses: 'any',
    group: 'Configuration',
    visibility: 'enabled',
  }),

  fullConfigSpec.filter({
    maxpeers: true,
    onlynet: true,
    onionOnly: true,
    peerbloomfilters: true,
    cfindex: true,
    torEnabled: true,
    torIsolation: true,
  }),

  async ({ effects }: { effects: any }) => {
    const conf = await bchdConf.read().once()
    const store = await storeJson.read().once()
    const onlynetFromConf = (conf?.onlynet as string[] | undefined)?.filter(Boolean) ?? []
    const onlynet = onlynetFromConf.length > 0
      ? (onlynetFromConf as OnlynetKey[])
      : [...ALL_ONLYNETS]
    const onionOnly = onlynetFromConf.length > 0 && onlynetFromConf.every((n) => n === 'onion')

    return {
      maxpeers: conf?.maxpeers ?? 125,
      onlynet,
      onionOnly,
      peerbloomfilters: conf?.nopeerbloomfilters !== 1,
      cfindex: conf?.nocfilters !== 1,
      torEnabled: store?.torEnabled ?? true,
      torIsolation: store?.torIsolation ?? true,
    }
  },

  async ({ effects, input }: { effects: any, input: any }) => {
    const onlynetList = (input.onlynet as string[] | undefined)?.filter(Boolean) ?? []
    const allSelected = ALL_ONLYNETS.every((n) => onlynetList.includes(n))
    const writeOnlynet = input.onionOnly
      ? ['onion']
      : (onlynetList.length > 0 && !allSelected ? onlynetList : undefined)

    await bchdConf.merge(effects, {
      maxpeers: input.maxpeers,
      onlynet: writeOnlynet,
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
