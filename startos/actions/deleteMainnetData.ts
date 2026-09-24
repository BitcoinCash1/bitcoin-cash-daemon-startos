import { sdk } from '../sdk'
import { rootDir } from '../utils'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'

const { InputSpec, Value } = sdk

const deleteMainnetSpec = InputSpec.of({
  confirm: Value.toggle({
    name: i18n('Confirm Permanent Deletion'),
    description: i18n(
      'I understand this permanently deletes all mainnet blockchain data from disk. The node will need to re-sync from genesis (or from checkpoint with Fast Sync). This cannot be undone.',
    ),
    default: false,
  }),
})

export const deleteMainnetData = sdk.Action.withInput(
  'delete-mainnet-data',

  async () => ({
    name: i18n('Delete Mainnet Data'),
    description: i18n(
      'Delete all mainnet blockchain data from disk and reset the node to a clean state. Required if you used Fast Sync and now want to enable the Transaction Index. Node configuration and credentials are preserved.',
    ),
    warning: i18n(
      'This permanently deletes all mainnet blocks, chainstate, and indexes. The node will re-sync from scratch on next start. This can take days on mainnet.',
    ),
    allowedStatuses: 'any',
    group: i18n('Maintenance'),
    visibility: 'enabled',
  }),

  deleteMainnetSpec,

  async () => ({ confirm: false }),

  async ({ effects, input }) => {
    if (!input.confirm) {
      return {
        version: '1' as const,
        title: i18n('Deletion Cancelled'),
        message: i18n(
          'Enable the confirmation toggle to proceed with deletion.',
        ),
        result: null,
      }
    }

    const mounts = sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: null,
      mountpoint: rootDir,
      readonly: false,
    })

    await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'bchd' },
      mounts,
      'delete-mainnet-data',
      async (sub) => {
        await sub.exec(['rm', '-rf', `${rootDir}/mainnet`])
      },
    )

    // Reset state flags so txindex and fastsync are available again on next sync.
    await storeJson.merge(effects, {
      fullySynced: false,
      fastSyncUsed: false,
    })

    return {
      version: '1' as const,
      title: i18n('Mainnet Data Deleted'),
      message: i18n(
        'All mainnet blockchain data has been deleted. Transaction Index and Fast Sync are now available. Restart BCHD to begin re-syncing from genesis.',
      ),
      result: null,
    }
  },
)
