import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'

const { InputSpec, Value } = sdk

const spec = InputSpec.of({
  name: Value.text({
    name: 'Credential Name',
    description:
      'A friendly label for this credential (e.g. "Fulcrum", "Explorer", "Wallet").',
    required: true,
    default: null,
    masked: false,
    placeholder: 'My Service',
  }),
  username: Value.text({
    name: 'Username',
    description: 'Alphanumeric username for RPC authentication.',
    required: true,
    default: null,
    masked: false,
    placeholder: 'myservice',
  }),
})

export const generateRpcCredential = sdk.Action.withInput(
  'generate-rpc-credential',

  async ({ effects }) => ({
    name: 'Generate RPC Credential',
    description:
      'Create a new named RPC credential. The generated password is stored and can be viewed later in "View RPC Credentials".',
    warning: null,
    allowedStatuses: 'any',
    group: 'Credentials',
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
      title: `RPC Credential: ${name}`,
      message: [
        'Credential saved. You can view it anytime in **View RPC Credentials**.',
        '',
        `**Name:** ${name}`,
        `**Username:** ${username}`,
        `**Password:** ${password}`,
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
