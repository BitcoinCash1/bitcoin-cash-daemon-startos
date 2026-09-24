import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'

const { InputSpec, Value } = sdk

const spec = InputSpec.of({
  name: Value.text({
    name: i18n('Credential Name'),
    description: i18n(
      'A friendly label for this credential (e.g. "Fulcrum", "Explorer", "Wallet").',
    ),
    required: true,
    default: null,
    masked: false,
    placeholder: 'My Service',
  }),
  username: Value.text({
    name: i18n('Username'),
    description: i18n('Alphanumeric username for RPC authentication.'),
    required: true,
    default: null,
    masked: false,
    placeholder: 'myservice',
  }),
})

export const generateRpcCredential = sdk.Action.withInput(
  'generate-rpc-credential',

  async ({ effects }) => ({
    name: i18n('Generate RPC Credential'),
    description: i18n(
      'Create a new named RPC credential. The generated password is stored and can be viewed later in "View RPC Credentials".',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Credentials'),
    visibility: 'enabled',
  }),

  spec,

  async ({ effects }) => ({
    name: undefined as string | undefined,
    username: undefined as string | undefined,
  }),

  async ({ effects, input }) => {
    const { name, username } = input

    // Generate a random 32-character password
    const chars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let password = ''
    const bytes = new Uint8Array(32)
    globalThis.crypto.getRandomValues(bytes)
    for (const b of bytes) {
      password += chars[b % chars.length]
    }

    // Read existing credentials and append
    const store = await storeJson.read().once()
    const creds = [...(store?.rpcCredentials ?? [])]

    // Remove any existing entry with the same name (replace)
    const filtered = creds.filter((c) => c.name !== name)
    filtered.push({ name, username, password })

    // Also update legacy rpcUser/rpcPassword to match the first credential
    const active = filtered[0]!
    await storeJson.merge(effects, {
      rpcCredentials: filtered,
      rpcUser: active.username,
      rpcPassword: active.password,
    })

    return {
      version: '1' as const,
      title: i18n('RPC Credential: ${name}', { name }),
      message: [
        i18n(
          'Credential saved. You can view it anytime in **View RPC Credentials**.',
        ),
        '',
        i18n('**Name:** ${name}', { name }),
        i18n('**Username:** ${username}', { username }),
        i18n('**Password:** ${password}', { password }),
      ].join('\n'),
      result: {
        type: 'single' as const,
        value: password,
        copyable: true,
        qr: false,
        masked: false,
      },
    }
  },
)
