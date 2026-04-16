import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const iniNumber = z.union([z.string().transform(Number), z.number()])

export const shape = z.object({
  txindex: z.literal(true).catch(true),
  addrindex: z.literal(true).catch(true),
  rpcuser: z.string().catch('bchd'),
  rpcpass: z.string().catch(''),
  rpclisten: z.string().catch('0.0.0.0:8332'),
  listen: z.string().catch('0.0.0.0:8333'),
  grpclisten: z.string().catch(''),
  nopeerbloomfilters: z.union([z.literal(1), z.literal(0)]).catch(0),
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
  prune: sdk.Value.number({
    name: 'Prune Target',
    description:
      'Limit blockchain storage (MB). 0 = disabled. Min 550 MB when enabled. Incompatible with txindex.',
    required: false,
    default: 0,
    min: 0,
    max: null,
    integer: true,
    units: 'MB',
    placeholder: '0 (disabled)',
    warning: 'Enabling pruning disables the transaction index.',
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
  peerbloomfilters: sdk.Value.toggle({
    name: 'Serve Bloom Filters (BIP37)',
    description:
      'Serve BIP37 bloom filters to peers. Useful for SPV wallets but can be a DoS vector on public-facing nodes. Disable if you do not need SPV wallet support.',
    default: true,
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
