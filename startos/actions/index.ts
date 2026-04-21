import { sdk } from '../sdk'
import { nodeSettings } from './configure'
import { rpcPeersSettings } from './rpcPeersSettings'
import { mempoolSettings } from './mempoolSettings'
import { autoconfig } from './config/autoconfig'
import { viewRpcCredentials } from './viewRpcCredentials'
import { generateRpcCredential } from './generateRpcCredential'
import { deleteRpcCredentials } from './deleteRpcCredentials'
import { networkSettings } from './networkSettings'
import { deleteTestNetworkData } from './deleteTestNetworkData'
import { reindexBlockchain } from './reindexBlockchain'
import { reindexChainstate } from './reindexChainstate'

export const actions = sdk.Actions.of()
  .addAction(networkSettings)
  .addAction(nodeSettings)
  .addAction(rpcPeersSettings)
  .addAction(mempoolSettings)
  .addAction(autoconfig)
  .addAction(viewRpcCredentials)
  .addAction(generateRpcCredential)
  .addAction(deleteRpcCredentials)
  // ── Maintenance ────────────────────────────────────────────────────────────
  .addAction(reindexBlockchain)
  .addAction(reindexChainstate)
  .addAction(deleteTestNetworkData)
