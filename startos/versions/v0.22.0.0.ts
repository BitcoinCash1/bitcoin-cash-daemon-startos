import { VersionInfo } from '@start9labs/start-sdk'

export const v_0_22_0_0 = VersionInfo.of({
  version: '0.22.0:0',
  releaseNotes:
    'Mandatory upgrade for the May 15, 2026 Bitcoin Cash network upgrade ("upgrade12"). ' +
    'All node operators must upgrade before activation to stay in consensus. ' +
    'Adds bounded looping (OP_BEGIN/OP_UNTIL), function definition (OP_DEFINE/OP_INVOKE), ' +
    'bitwise ops (OP_INVERT, OP_LSHIFTNUM, OP_RSHIFTNUM, OP_LSHIFTBIN, OP_RSHIFTBIN), ' +
    'and Pay-to-Script standardization (CHIP-2024-12 P2S). ' +
    'Also moves Bloom Filters and Compact Block Filter settings to Node Settings.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
