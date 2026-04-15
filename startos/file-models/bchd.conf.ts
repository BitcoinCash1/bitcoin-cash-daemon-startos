import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const iniNumber = z.union([z.string().transform(Number), z.number()])

export const shape = z.object({
  txindex: z.literal(true).catch(true),
  addrindex: z.literal(true).catch(true),
  rpcuser: z.string().catch('bitcoin-cash-daemon'),
  rpcpass: z.string().catch(''),
  rpclisten: z.string().catch('0.0.0.0:8332'),
  listen: z.string().catch('0.0.0.0:8333'),
  grpclisten: z.string().catch(''),
  dbcachesize: iniNumber.catch(500),
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
      'BCHD does not support ZMQ. It uses gRPC pub/sub for real-time notifications instead. This toggle is accepted for compatibility with dependent packages but has no effect.',
    default: true,
  }),
  txindex: sdk.Value.toggle({
    name: 'Transaction Index',
    description:
      'BCHD always maintains a full transaction index (txindex). This toggle is accepted for compatibility but BCHD requires txindex to be enabled.',
    default: true,
  }),
  prune: sdk.Value.number({
    name: 'Prune (MB)',
    description:
      'BCHD supports block pruning via a block-depth mechanism (not MB-based). This field is accepted for compatibility with dependent packages but has no effect. To enable pruning, use the BCHD config file directly.',
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
      'Enable the gRPC API on port 8335. Provides modern API access, BIP 157/158 compact block filters (Neutrino), and pub/sub notifications.',
    default: true,
  }),
  dbcachesize: sdk.Value.number({
    name: 'Database Cache (MiB)',
    description: 'Maximum size of the database cache in MiB. Higher values use more RAM but improve sync performance.',
    required: true,
    default: 500,
    min: 64,
    max: 16384,
    integer: true,
    units: 'MiB',
  }),
  maxpeers: sdk.Value.number({
    name: 'Max Peers',
    description: 'Maximum number of inbound and outbound peer connections.',
    required: true,
    default: 125,
    min: 0,
    max: 1000,
    integer: true,
    units: null,
  }),
  torEnabled: sdk.Value.toggle({
    name: 'Tor Routing',
    description:
      'Route all outbound connections through the Tor network for enhanced privacy. ' +
      'Requires the Tor package to be installed and running.',
    default: false,
  }),
  torIsolation: sdk.Value.toggle({
    name: 'Tor Stream Isolation',
    description:
      'Use a separate Tor circuit for each peer connection (torisolation). Provides stronger privacy at the cost of slightly slower connection establishment.',
    default: false,
  }),
})
