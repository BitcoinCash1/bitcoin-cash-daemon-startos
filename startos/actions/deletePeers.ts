import { sdk } from '../sdk'
import { mainMounts } from '../mounts'
import { rootDir } from '../utils'
import { i18n } from '../i18n'

export const deletePeers = sdk.Action.withoutInput(
  'delete-peers',
  async ({ effects: _effects }) => ({
    name: i18n('Delete Peer List'),
    description: i18n(
      'Delete the peer address database to reset known peers. BCHD will rebuild it from DNS seeds on next startup.',
    ),
    warning: i18n(
      'All known peer addresses will be lost. The node will need to rediscover peers on next startup, which may take a few minutes.',
    ),
    allowedStatuses: 'only-stopped' as const,
    group: i18n('Maintenance'),
    visibility: 'enabled' as const,
  }),
  async ({ effects }) => {
    await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'bchd' },
      mainMounts,
      'delete-peers',
      async (sub) => {
        // BCHD keeps peer state in peers.json (and legacy peers.dat).
        await sub.exec([
          'sh',
          '-c',
          `rm -f ${rootDir}/peers.json ${rootDir}/peers.dat`,
        ])
      },
    )
    return {
      version: '1' as const,
      title: i18n('Peer List Deleted'),
      message: i18n(
        'Peer address database removed. BCHD will rebuild it from DNS seeds on next startup.',
      ),
      result: null,
    }
  },
)
