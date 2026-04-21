import { sdk } from '../sdk'
import { storeJson } from '../file-models/store.json'

export const reindexBlockchain = sdk.Action.withoutInput(
  'reindex-blockchain',
  async ({ effects: _effects }) => ({
    name: 'Reindex Blockchain',
    description:
      'Delete the chainstate and re-verify every block from genesis. Use this if the chainstate database is corrupted. BCHD will restart automatically.',
    warning:
      'This re-verifies the entire blockchain from scratch and can take many hours. Do not interrupt once started.',
    allowedStatuses: 'any' as const,
    group: 'Maintenance',
    visibility: 'enabled' as const,
  }),
  async ({ effects }) => {
    await storeJson.merge(effects, { reindexBlockchain: true, fullySynced: false })
    await effects.restart()
    return null
  },
)
