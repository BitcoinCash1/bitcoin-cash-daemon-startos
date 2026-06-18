import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_22_0_21 = VersionInfo.of({
  version: '0.22.0:21',
  releaseNotes:
    'Address Index is now a separate toggle in Node Settings (default OFF), ' +
    'decoupled from Transaction Index. The address index is the slow part of ' +
    'initial sync (upstream bchd issue #219) and is only needed if a consumer ' +
    'queries addresses directly from BCHD — Fulcrum and most explorers build ' +
    'their own. Running Transaction Index alone now syncs dramatically faster. ' +
    'When an index is enabled later it rebuilds from genesis; the logs announce ' +
    'which index is rebuilding so the "INDX: Indexed ... height H/Y (PP%)" ' +
    'progress lines are attributable per-index.',
  migrations: {
    // No migration: existing installs keep their stored addrindex value (we do
    // NOT auto-disable it mid-sync). The OFF default applies to the toggle
    // prefill and fresh installs. New store fields use Zod .catch defaults.
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
