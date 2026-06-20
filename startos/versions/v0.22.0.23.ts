import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_22_0_23 = VersionInfo.of({
  version: '0.22.0:23',
  releaseNotes:
    'Health checks are now resilient during initial sync. BCHD RPC calls that ' +
    'take the chain lock (getblockchaininfo, getpeerinfo) can stall for seconds ' +
    'to minutes while validating large modern blocks, which made "Blockchain ' +
    'Sync" flap to "Waiting for sync info" and "Peer Connections" to "Unable to ' +
    'query peers" even though the node was syncing fine. The checks now use the ' +
    'cheap, always-responsive getinfo as the liveness/height source (with a ' +
    'short-timeout getblockchaininfo for the %), and bchd --rpcmaxclients is ' +
    'raised from the default 10 to 50 so concurrent health-check calls are not ' +
    'rejected during IBD.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
