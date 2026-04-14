import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const iniNumber = z.union([z.string().transform(Number), z.number()])

export const shape = z.object({
  txindex: z.literal(true).catch(true),
  addrindex: z.literal(true).catch(true),
  rpcuser: z.string().catch('bitcoin-cash-node'),
  rpcpass: z.string().catch(''),
  rpclisten: z.string().catch('0.0.0.0:8332'),
  listen: z.string().catch('0.0.0.0:8333'),
  grpclisten: z.string().catch(''),
  dbcachesizemb: iniNumber.catch(512),
  maxpeers: iniNumber.catch(125),
})

export const bchdConf = FileHelper.ini(
  {
    base: sdk.volumes.main,
    subpath: 'bchd.conf',
  },
  shape,
)

// Config spec for user-facing action and autoconfig
export const fullConfigSpec = sdk.InputSpec.of({
  zmqEnabled: sdk.Value.toggle({
    name: 'ZMQ Notifications',
    description:
      'BCHD uses gRPC pub/sub instead of ZMQ. This toggle is accepted for compatibility with dependent packages but has no effect.',
    default: true,
  }),
  txindex: sdk.Value.toggle({
    name: 'Transaction Index',
    description:
      'BCHD always maintains a full transaction index. This cannot be disabled.',
    default: true,
    disabled: 'BCHD always maintains a full transaction index',
  }),
  prune: sdk.Value.number({
    name: 'Prune (MB)',
    description:
      'BCHD does not support block pruning. This field is accepted for compatibility but has no effect.',
    required: false,
    default: null,
    min: 0,
    max: 0,
    integer: true,
    units: 'MB',
  }),
  grpcEnabled: sdk.Value.toggle({
    name: 'gRPC API',
    description:
      'Enable the gRPC API on port 8335. Provides modern API access, BIP 157/158 compact block filters, and pub/sub notifications.',
    default: true,
  }),
  dbcachesizemb: sdk.Value.number({
    name: 'Database Cache (MB)',
    description: 'RAM allocated to the UTXO database cache.',
    required: true,
    default: 512,
    min: 64,
    max: 16384,
    integer: true,
    units: 'MB',
  }),
  maxpeers: sdk.Value.number({
    name: 'Max Peers',
    description: 'Maximum number of peer connections.',
    required: true,
    default: 125,
    min: 0,
    max: 1000,
    integer: true,
    units: null,
  }),
})
