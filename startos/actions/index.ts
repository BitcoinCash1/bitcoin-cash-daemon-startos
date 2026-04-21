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

export const actions = sdk.Actions.of()
  .addAction(networkSettings)
  .addAction(nodeSettings)
  .addAction(rpcPeersSettings)
  .addAction(mempoolSettings)
  .addAction(autoconfig)
  .addAction(viewRpcCredentials)
  .addAction(generateRpcCredential)
  .addAction(deleteRpcCredentials)
  .addAction(deleteTestNetworkData)
