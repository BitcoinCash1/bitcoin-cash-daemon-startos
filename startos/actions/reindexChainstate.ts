import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'

export const reindexChainstate = sdk.Action.withoutInput(
  'reindex-chainstate',
  async ({ effects: _effects }) => ({
    name: i18n('Reindex Chainstate'),
    description: i18n(
      'Rebuild the UTXO chainstate from the existing block index without re-downloading blocks. Faster than a full reindex. Use this if the chainstate is corrupted but blocks are intact.',
    ),
    warning: i18n(
      'This rebuilds the chainstate database and can take several hours. BCHD will restart automatically.',
    ),
    allowedStatuses: 'any' as const,
    group: i18n('Maintenance'),
    visibility: 'enabled' as const,
  }),
  async ({ effects }) => {
    await storeJson.merge(effects, {
      reindexChainstate: true,
      fullySynced: false,
    })
    await effects.restart()
    return {
      version: '1' as const,
      title: i18n('Chainstate Reindex Queued'),
      message: i18n(
        'BCHD is restarting and will rebuild the UTXO chainstate from the existing block index. This can take several hours.',
      ),
      result: null,
    }
  },
)
