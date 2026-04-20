import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const iniNumber = z.union([z.string().transform(Number), z.number()])
const iniStringArray = z
  .union([z.array(z.string()), z.string().transform((s) => [s])])
  .optional()
  .catch(undefined)

export const ONLYNET_VALUES = {
  ipv4: 'IPv4',
  ipv6: 'IPv6',
  onion: 'Tor (.onion)',
} as const
export type OnlynetKey = keyof typeof ONLYNET_VALUES
export const ALL_ONLYNETS = Object.keys(ONLYNET_VALUES) as OnlynetKey[]

export const shape = z.object({
  txindex: z.union([z.literal(1), z.literal(0), z.boolean()]).catch(1),
  addrindex: z.union([z.literal(1), z.literal(0), z.boolean()]).catch(1),
  rpcuser: z.string().catch('bchd'),
  rpcpass: z.string().catch(''),
  rpclisten: z.string().catch('0.0.0.0:8332'),
  listen: z.string().catch('0.0.0.0:8333'),
  grpclisten: z.string().catch('0.0.0.0:8335'),
  nocfilters: z.union([z.literal(1), z.literal(0)]).catch(0),
  nopeerbloomfilters: z.union([z.literal(1), z.literal(0)]).catch(0),
  dbcachesize: iniNumber.catch(2048),
  dbflushinterval: iniNumber.catch(1800),
  maxpeers: iniNumber.catch(125),
  onlynet: iniStringArray,
  excessiveblocksize: iniNumber.catch(32000000),
  minrelaytxfee: z.union([z.string().transform(Number), z.number()]).catch(0.00001),
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
  txindex: sdk.Value.toggle({
    name: 'Transaction Index',
    description:
      'Build a full transaction index. Required by Fulcrum and other indexers. Cannot be enabled with pruning.',
    default: true,
  }),
  prune: sdk.Value.number({
    name: 'Prune Depth',
    description:
      'Number of recent blocks to retain. 0 = disabled (keep full chain). Minimum 288 blocks when enabled. Incompatible with txindex.',
    required: false,
    default: 0,
    min: 0,
    max: null,
    integer: true,
    units: 'blocks',
    placeholder: '0 (disabled)',
    warning: 'Enabling pruning disables the transaction index.',
  }),
  grpcEnabled: sdk.Value.toggle({
    name: 'gRPC API',
    description:
      'Enable the gRPC API on port 8335. Provides modern API access and pub/sub notifications.',
    default: true,
  }),
  dbcachesize: sdk.Value.number({
    name: 'Database Cache (MiB)',
    description:
      'Size of the in-memory database cache. Larger values speed up IBD and general operation at the cost of RAM usage.',
    required: true,
    default: 2048,
    min: 64,
    max: 16384,
    integer: true,
    units: 'MiB',
  }),
  dbflushinterval: sdk.Value.number({
    name: 'Database Flush Interval',
    description:
      'Seconds between database flushes. BCHD batches writes to its bolt key-value store for performance. Lower values flush more often (safer but slower), higher values batch more (faster but risk data on crash).',
    required: true,
    default: 1800,
    min: 60,
    max: 7200,
    integer: true,
    units: 'seconds',
    placeholder: '1800',
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
  onlynet: sdk.Value.multiselect({
    name: 'Allowed Networks',
    description:
      'Restrict outbound peer connections to selected network types. Leave all selected to allow all networks.',
    default: ALL_ONLYNETS,
    values: ONLYNET_VALUES,
    minLength: 1,
    maxLength: null,
  }),
  onionOnly: sdk.Value.toggle({
    name: 'Onion-Only Mode',
    description:
      'Force peer connections to Tor only (equivalent to onlynet=onion). Disabled by default so Tor and clearnet can coexist.',
    default: false,
  }),
  peerbloomfilters: sdk.Value.toggle({
    name: 'Serve Bloom Filters (BIP37)',
    description:
      'Serve BIP37 bloom filters to peers. Useful for SPV wallets but can be a DoS vector on public-facing nodes. Disable if you do not need SPV wallet support.',
    default: true,
  }),
  cfindex: sdk.Value.toggle({
    name: 'Compact Block Filters (BIP 157/158)',
    description:
      'Build and serve compact block filters (Neutrino). Required by light wallets using the BIP 157/158 protocol.',
    default: true,
  }),
  torEnabled: sdk.Value.toggle({
    name: 'Tor Routing',
    description:
      'Route all outbound connections through the Tor network for enhanced privacy. ' +
      'Requires the Tor package to be installed and running.',
    default: true,
  }),
  torIsolation: sdk.Value.toggle({
    name: 'Tor Stream Isolation',
    description:
      'Use a separate Tor circuit for each peer connection (torisolation). Provides stronger privacy at the cost of slightly slower connection establishment.',
    default: true,
  }),
  excessiveblocksize: sdk.Value.number({
    name: 'Excessive Block Size',
    description: 'Max accepted block size in bytes. BCHD default: 32000000 (32 MB).',
    required: false,
    default: null,
    min: 1000000,
    max: null,
    integer: true,
    units: 'bytes',
    placeholder: '32000000',
  }),
  minrelaytxfee: sdk.Value.number({
    name: 'Minimum Relay Fee',
    description: 'Minimum fee rate (BCH/kB) for relaying transactions.',
    required: false,
    default: null,
    min: 0,
    max: null,
    integer: false,
    units: 'BCH/kB',
    placeholder: '0.00001',
    step: 0.000001,
  }),
})
