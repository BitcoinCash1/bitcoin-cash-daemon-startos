import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_22_0_25 = VersionInfo.of({
  version: '0.22.0:25',
  releaseNotes:
    'Fix "Syncing 100%" never flipping to "Synced". The Blockchain Sync and ' +
    'Peer Connections health checks now mirror the BCHN reference exactly: ' +
    'getblockchaininfo with the node\'s own initialblockdownload flag as the ' +
    'single source of truth (BCHD omits it when synced), and getpeerinfo for the ' +
    'peer count — no mediantime/height heuristics, which had false-positived a ' +
    'fully-synced node as "Syncing 100%" whenever BCH had a normal multi-hour ' +
    'block gap. Also: the RPC & Peers prefill now defaults Tor Stream Isolation ' +
    'to off, matching the toggle/store default; and saving RPC & Peers settings ' +
    'now restarts the node so a Tor on/off toggle actually takes effect (the ' +
    'Tor health check and --onion arg previously stayed stale until an unrelated ' +
    'config change forced a restart).',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
