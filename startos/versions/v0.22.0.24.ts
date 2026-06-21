import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_22_0_24 = VersionInfo.of({
  version: '0.22.0:24',
  releaseNotes:
    'Per-index rebuild progress now logs DURING the rebuild. The labeled ' +
    '"[Index Rebuild] <Transaction|Address> Index catch-up: H/Y (PP%)" line was ' +
    'emitted from the sync health check, which is dormant while RPC is offline — ' +
    'and bchd runs index catch-up before its RPC server starts, so the line never ' +
    'fired during the catch-up. It is now emitted from the primary daemon\'s ' +
    'startup readiness poll (which reads the log file, not RPC), so it appears ' +
    'live throughout the rebuild.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
