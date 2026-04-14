import { sdk } from './sdk'
import { rpcPort, peerPort, grpcPort, rpcInterfaceId, peerInterfaceId, grpcInterfaceId } from './utils'
import { bchdConf } from './file-models/bchd.conf'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const conf = await bchdConf.read().const(effects)
  const receipts = []

  // ── RPC ──────────────────────────────────────────────────────────────
  const rpcMulti = sdk.MultiHost.of(effects, 'rpc')
  const rpcOrigin = await rpcMulti.bindPort(rpcPort, {
    protocol: 'http',
    preferredExternalPort: rpcPort,
  })
  const rpc = sdk.createInterface(effects, {
    name: 'RPC Interface',
    id: rpcInterfaceId,
    description: 'JSON-RPC interface for BCHD — compatible with BCHN RPC',
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })
  receipts.push(await rpcOrigin.export([rpc]))

  // ── P2P ──────────────────────────────────────────────────────────────
  const peerMulti = sdk.MultiHost.of(effects, 'peer')
  const peerOrigin = await peerMulti.bindPort(peerPort, {
    protocol: null,
    preferredExternalPort: peerPort,
    addSsl: null,
    secure: { ssl: false },
  })
  const peer = sdk.createInterface(effects, {
    name: 'Peer Interface',
    id: peerInterfaceId,
    description: 'Peer-to-peer connections on the Bitcoin Cash network',
    type: 'p2p',
    masked: false,
    schemeOverride: { ssl: null, noSsl: null },
    username: null,
    path: '',
    query: {},
  })
  receipts.push(await peerOrigin.export([peer]))

  // ── gRPC (conditional) ──────────────────────────────────────────────
  const grpcEnabled = (conf?.grpclisten ?? '') !== ''
  if (grpcEnabled) {
    const grpcMulti = sdk.MultiHost.of(effects, 'grpc')
    const grpcOrigin = await grpcMulti.bindPort(grpcPort, {
      protocol: 'http',
      preferredExternalPort: grpcPort,
    })
    const grpc = sdk.createInterface(effects, {
      name: 'gRPC Interface',
      id: grpcInterfaceId,
      description:
        'gRPC API — BIP 157/158 compact block filters, pub/sub notifications',
      type: 'api',
      masked: false,
      schemeOverride: null,
      username: null,
      path: '',
      query: {},
    })
    receipts.push(await grpcOrigin.export([grpc]))
  }

  return receipts
})
