import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_22_0_2 = VersionInfo.of({
  version: '0.22.0:2',
  releaseNotes:
    'Fix RPC Plaintext Proxy health alert "stdout maxBuffer length exceeded": ' +
    'silence stunnel logging (debug=0, output=/dev/null, syslog=no) and ' +
    'redirect remaining stdout/stderr to /dev/null so the daemon stream ' +
    'no longer fills up over long uptimes. No functional change.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
