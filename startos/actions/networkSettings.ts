import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { NETWORKS } from '../utils'
import { i18n } from '../i18n'

const { InputSpec, Value } = sdk

const networkSpec = InputSpec.of({
  network: Value.select({
    name: i18n('Chain Network'),
    description: i18n(
      'Bitcoin Cash network to run. Changing this restarts BCHD and syncs the selected network from its own separate data directory.',
    ),
    warning: i18n(
      'Mainnet data is preserved. Chipnet/regtest use separate data directories and can be cleaned via Maintenance actions.',
    ),
    values: {
      mainnet: i18n('Mainnet'),
      testnet3: i18n('Testnet3 (BCH test network)'),
      testnet4: i18n('Testnet4 (BCH test network v4)'),
      chipnet: i18n('Chipnet (upgrade testing network)'),
      regtest: i18n('Regtest (local/private testing network)'),
    },
    default: 'mainnet',
  }),
})

export const networkSettings = sdk.Action.withInput(
  'network-settings',

  async () => ({
    name: i18n('Chain Network'),
    description: i18n(
      'Select the BCH chain network for this node. RPC/P2P/gRPC ports are adjusted automatically for the selected network.',
    ),
    warning: i18n(
      'Changing network restarts BCHD immediately. The selected network may need a full sync if no prior data exists.',
    ),
    allowedStatuses: 'any',
    group: i18n('Configuration'),
    visibility: 'enabled',
  }),

  networkSpec,

  async () => {
    const store = await storeJson.read().once()
    const current = store?.network
    return {
      network: NETWORKS.includes(current as (typeof NETWORKS)[number])
        ? current
        : 'mainnet',
    }
  },

  async ({ effects, input }) => {
    const store = await storeJson.read().once()
    const current = store?.network ?? 'mainnet'
    const next = input.network

    if (current === next) {
      return {
        version: '1' as const,
        title: i18n('Network Unchanged'),
        message: i18n('BCHD is already configured for ${next}.', { next }),
        result: null,
      }
    }

    await storeJson.merge(effects, {
      network: next,
      fullySynced: false,
    })
    await effects.restart()

    return {
      version: '1' as const,
      title: i18n('Network Updated'),
      message: i18n(
        'Switched BCHD from ${current} to ${next}. Restart triggered automatically.',
        { current, next },
      ),
      result: null,
    }
  },
)
