export const NETWORKS = ['mainnet', 'chipnet', 'regtest'] as const
export type Network = (typeof NETWORKS)[number]

export const networkPorts: Record<Network, { rpc: number; peer: number; grpc: number }> = {
	mainnet: { rpc: 8332, peer: 8333, grpc: 8335 },
	chipnet: { rpc: 48334, peer: 48333, grpc: 48335 },
	regtest: { rpc: 18444, peer: 18445, grpc: 18446 },
}

export const networkFlag: Record<Network, string | null> = {
	mainnet: null,
	chipnet: '--chipnet',
	regtest: '--regtest',
}

export const rpcPort = networkPorts.mainnet.rpc
export const peerPort = networkPorts.mainnet.peer
export const grpcPort = networkPorts.mainnet.grpc
export const rpcPlaintextPort = 8334
export const rpcInterfaceId = 'rpc'
export const peerInterfaceId = 'peer'
export const grpcInterfaceId = 'grpc'
export const rpcPlaintextInterfaceId = 'rpc-plaintext'
export const rootDir = '/data'
