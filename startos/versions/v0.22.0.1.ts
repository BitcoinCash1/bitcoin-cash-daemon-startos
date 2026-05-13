import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_22_0_1 = VersionInfo.of({
  version: '0.22.0:1',
  releaseNotes:
    'Clarify the interface descriptions to reflect how BCHD is actually used: ' +
    'the standard RPC Interface is what almost all software talks to; ' +
    "BCHD's gRPC API is rarely used because clients must be explicitly " +
    'designed against its schema, and very little software is. ' +
    'The Plaintext Proxy text now spells out that it is a thin stunnel ' +
    'sidecar that exists only for ckpool-lineage miners (asicseer-pool, ckpool) ' +
    'which have no TLS support. No runtime behavior changes.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
