import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_22_0_3 = VersionInfo.of({
  version: '0.22.0:3',
  releaseNotes:
    'Fix recurring "RPC Plaintext Proxy: stdout maxBuffer length exceeded" health alert. ' +
    'The port-ready check now uses a zero-touch /proc/net/tcp probe instead of opening ' +
    'a TCP connection to the stunnel port, which previously caused Node.js to buffer the ' +
    'raw TLS handshake bytes until the maxBuffer limit was exceeded.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
