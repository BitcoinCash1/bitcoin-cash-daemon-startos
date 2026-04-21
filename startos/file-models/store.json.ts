import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const rpcCredentialShape = z.object({
  name: z.string(),
  username: z.string(),
  password: z.string(),
})

export type RpcCredential = z.infer<typeof rpcCredentialShape>

export const shape = z.object({
  rpcUser: z.string().catch('bchd'),
  rpcPassword: z.string().catch(''),
  rpcCredentials: z.array(rpcCredentialShape).catch([]),
  network: z.enum(['mainnet']).catch('mainnet'),
  fullySynced: z.boolean().catch(false),
  torEnabled: z.boolean().catch(true),
  torIsolation: z.boolean().catch(true),
  pruneDepth: z.number().catch(0),
})

export const storeJson = FileHelper.json(
  {
    base: sdk.volumes.main,
    subpath: 'store.json',
  },
  shape,
)
