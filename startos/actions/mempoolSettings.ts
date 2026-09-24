import { sdk } from '../sdk'
import { bchdConf, fullConfigSpec } from '../fileModels/bchd.conf'
import { i18n } from '../i18n'

export const mempoolSettings = sdk.Action.withInput(
  'mempool-settings',

  async ({ effects }) => ({
    name: i18n('Mempool & Block Policy'),
    description: i18n(
      'Configure excessive block size and minimum relay fee. The mempool acts as an in-memory area for unconfirmed transactions; BCHD batches writes to its bolt database for efficient processing.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Configuration'),
    visibility: 'enabled',
  }),

  fullConfigSpec.filter({
    excessiveblocksize: true,
    minrelaytxfee: true,
  }),

  async ({ effects }) => {
    const conf = await bchdConf.read().once()
    return {
      excessiveblocksize: conf?.excessiveblocksize ?? 32000000,
      minrelaytxfee: conf?.minrelaytxfee ?? 0.00001,
    }
  },

  async ({ effects, input }) => {
    const patch: Record<string, unknown> = {}
    if (input.excessiveblocksize != null)
      patch.excessiveblocksize = input.excessiveblocksize
    if (input.minrelaytxfee != null) patch.minrelaytxfee = input.minrelaytxfee
    if (Object.keys(patch).length) {
      await bchdConf.merge(effects, patch as any)
    }
    return null
  },
)
