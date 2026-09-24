import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { rpcPort } from '../utils'
import { i18n } from '../i18n'

const { InputSpec, Value } = sdk

export const viewRpcCredentials = sdk.Action.withInput(
  'view-rpc-credentials',

  async ({ effects }) => ({
    name: i18n('View RPC Credentials'),
    description: i18n(
      'View stored RPC credentials by name. Select a credential to see its username, password, and port.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Credentials'),
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    const store = await storeJson.read().once()
    const creds = store?.rpcCredentials ?? []

    if (creds.length === 0) {
      return InputSpec.of({
        name: Value.select({
          name: i18n('Credential'),
          description: i18n('No credentials found. Generate one first.'),
          values: { '': i18n('(none)') },
          default: '',
        }),
      })
    }

    const values: Record<string, string> = {}
    for (const c of creds) values[c.name] = c.name

    return InputSpec.of({
      name: Value.select({
        name: i18n('Credential'),
        description: i18n('Select a stored credential to view its details.'),
        values,
        default: creds[0]!.name,
      }),
    })
  },

  async ({ effects }) => {
    const store = await storeJson.read().once()
    const creds = store?.rpcCredentials ?? []
    return { name: creds[0]?.name ?? '' }
  },

  async ({ effects, input }) => {
    const store = await storeJson.read().once()
    const creds = store?.rpcCredentials ?? []
    const selected = creds.find((c) => c.name === input.name)

    if (!selected) {
      return {
        version: '1' as const,
        title: i18n('Credential Not Found'),
        message: i18n('The selected credential was not found.'),
        result: null,
      }
    }

    const isDefault = creds[0]?.name === selected.name

    return {
      version: '1' as const,
      title: i18n('RPC Credential: ${name}', { name: selected.name }),
      message: [
        isDefault
          ? i18n('**Name:** ${name} (active)', { name: selected.name })
          : i18n('**Name:** ${name}', { name: selected.name }),
        i18n('**Username:** ${username}', { username: selected.username }),
        i18n('**Password:** ${password}', { password: selected.password }),
        i18n('**Port:** ${port}', { port: String(rpcPort) }),
      ].join('\n'),
      result: {
        type: 'single' as const,
        value: `${selected.username}:${selected.password}`,
        copyable: true,
        qr: false,
        masked: true,
      },
    }
  },
)
