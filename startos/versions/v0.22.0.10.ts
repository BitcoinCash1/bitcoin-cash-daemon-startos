import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_22_0_10 = VersionInfo.of({
  version: '0.22.0:10',
  releaseNotes: 'Fix slow IBD: --proxy no longer routes clearnet peers through Tor. Only --onion is set for normal operation; --proxy is reserved for onlynet=onion mode. Clearnet peers now connect directly, matching BCHN and Flowee behavior.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
