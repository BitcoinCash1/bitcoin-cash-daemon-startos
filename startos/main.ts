import { sdk } from './sdk'
import { Network, networkFlag, networkPorts, rootDir } from './utils'
import { bchdConf } from './fileModels/bchd.conf'
import { storeJson } from './fileModels/store.json'
import { mainMounts } from './mounts'

export { mainMounts }

export const main = sdk.setupMain(async ({ effects }) => {
  console.log('Starting BCHD!')

  const conf = await bchdConf.read().const(effects)
  const store = await storeJson.read().once()
  const network: Network =
    store?.network === 'chipnet' || store?.network === 'regtest'
      ? store.network
      : 'mainnet'
  const { rpc: rpcPort, peer: peerPort, grpc: grpcPort } = networkPorts[network]
  const netFlag = networkFlag[network]
  const activeCred = store?.rpcCredentials?.[0]
  const rpcUser = activeCred?.username ?? store?.rpcUser ?? 'bchd'
  const rpcPassword = activeCred?.password ?? store?.rpcPassword ?? ''
  const torEnabled = store?.torEnabled ?? true

  const grpcEnabled = (conf?.grpclisten ?? '') !== ''
  const onlynetList = ((conf?.onlynet as string[] | undefined) ?? []).filter(Boolean)
  const onlynetActive = onlynetList.length > 0
  const onionOnly = onlynetActive && onlynetList.every((n) => n === 'onion')
  const externalip = (store?.externalip ?? []).filter(Boolean)

  // Read and clear reindex flags
  const reindexBlockchain = store?.reindexBlockchain ?? false
  const reindexChainstate = store?.reindexChainstate ?? false
  if (reindexBlockchain || reindexChainstate) {
    await storeJson.merge(effects, { reindexBlockchain: false, reindexChainstate: false })
  }

  // Tor — get container IP (restarts BCHD if it changes)
  const torIp = torEnabled
    ? await sdk.getContainerIp(effects, { packageId: 'tor' }).const()
    : null

  // Track Tor running status dynamically
  let torRunning = false
  if (torIp) {
    sdk.getStatus(effects, { packageId: 'tor' }).onChange((status) => {
      torRunning = status?.desired.main === 'running'
      return { cancel: false }
    })
  }

  const bchdArgs: string[] = [
    `--configfile=${rootDir}/bchd.conf`,
    `--datadir=${rootDir}`,
    `--rpcuser=${rpcUser}`,
    `--rpcpass=${rpcPassword}`,
    `--rpclisten=0.0.0.0:${rpcPort}`,
    `--listen=0.0.0.0:${peerPort}`,
  ]

  if (netFlag) {
    bchdArgs.push(netFlag)
  }

  // Apply onlynet restrictions only when explicitly narrowed from default-all.
  for (const net of onlynetList) {
    bchdArgs.push(`--onlynet=${net}`)
  }

  const fullySynced = store?.fullySynced ?? false
  const torProxyActive = Boolean(torIp && fullySynced)

  // Advertise externalip endpoints for inbound peers (written by watchHosts).
  // Onion externalips require an active Tor proxy — otherwise BCHD tries to
  // DNS-resolve the .onion and drops it with
  //   "[WRN] SRVR: Not adding <addr>.onion:<port> as externalip: attempt to
  //    resolve tor address"
  // which permanently omits the address from localaddresses for the run. We
  // skip onion externalips while Tor is deferred (IBD); they are re-applied
  // on the restart that happens when fullySynced flips to true.
  for (const ip of externalip) {
    if (ip.includes('.onion') && !torProxyActive) {
      console.log(`Deferring onion externalip until Tor proxy is active: ${ip}`)
      continue
    }
    bchdArgs.push(`--externalip=${ip}`)
  }

  // txindex / addrindex (conditional)
  if (conf?.txindex === 1 || conf?.txindex === true) {
    bchdArgs.push('--txindex')
    bchdArgs.push('--addrindex')
  }

  // Tor proxy args — skipped during IBD to avoid crippling sync speed
  if (torProxyActive) {
    bchdArgs.push(`--proxy=${torIp}:9050`)
    bchdArgs.push(`--onion=${torIp}:9050`)
    if (store?.torIsolation) {
      bchdArgs.push('--torisolation')
    }
  } else if (torEnabled && !fullySynced) {
    console.log('Tor routing deferred until initial block download completes')
  }

  if (grpcEnabled) {
    bchdArgs.push(`--grpclisten=0.0.0.0:${grpcPort}`)
  }

  // Reindex flags (cleared from store above so they only apply once)
  if (reindexBlockchain) {
    bchdArgs.push('--reindex')
  } else if (reindexChainstate) {
    bchdArgs.push('--reindexchainstate')
  }

  // BIP 157/158 compact block filters
  if (conf?.nocfilters === 1) {
    bchdArgs.push('--nocfilters')
  }

  // Pruning
  const pruneDepth = store?.pruneDepth ?? 0
  if (pruneDepth > 0) {
    bchdArgs.push('--prune')
    bchdArgs.push(`--prunedepth=${pruneDepth}`)
  }

  if (conf?.dbcachesize) {
    bchdArgs.push(`--dbcachesize=${conf.dbcachesize}`)
  }
  if (conf?.maxpeers != null) {
    bchdArgs.push(`--maxpeers=${conf.maxpeers}`)
  }
  if (conf?.nopeerbloomfilters === 1) {
    bchdArgs.push('--nopeerbloomfilters')
  }

  // Disable TLS for RPC in container context
  bchdArgs.push('--notls')
  // Point to generated certs (BCHD requires them even with --notls for P2P listener)
  bchdArgs.push(`--rpccert=${rootDir}/rpc.cert`)
  bchdArgs.push(`--rpckey=${rootDir}/rpc.key`)

  const bchdSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'bchd' },
    mainMounts,
    'node-sub',
  )

  async function rpc(...args: string[]) {
    return bchdSub.exec([
      'bchctl',
      `--rpcserver=127.0.0.1:${rpcPort}`,
      `--rpcuser=${rpcUser}`,
      `--rpcpass=${rpcPassword}`,
      '--notls',
      ...args,
    ])
  }

  async function grpcReady() {
    // Use a LISTEN-state check against /proc so we don't actually open a TCP
    // connection to the gRPC port. bchd's gRPC is HTTP/2 over TLS; any
    // bare TCP probe (nc -z, etc.) that accepts+closes without sending a
    // ClientHello causes the Go stdlib to log a `TLS handshake error
    // from <addr>: EOF` every probe interval. /proc/net/tcp is zero-touch.
    const hexPort = grpcPort.toString(16).toUpperCase().padStart(4, '0')
    const probe = await bchdSub.exec([
      'sh',
      '-c',
      `awk -v p=":${hexPort}" '$4=="0A" && $2 ~ p"$" {found=1} END{exit !found}' /proc/1/net/tcp /proc/1/net/tcp6`,
    ])
    return probe.exitCode === 0
  }

  const excludedByOnlynet = () => ({
    result: 'disabled' as const,
    message: 'Excluded by onlynet',
  })

  return sdk.Daemons.of(effects)
    .addOneshot('nocow', {
      subcontainer: null,
      exec: {
        fn: async () => {
          try {
            const mkdirRes = await bchdSub.exec(['mkdir', '-p', rootDir])
            if (mkdirRes.exitCode !== 0) {
              console.warn(`nocow: mkdir failed for ${rootDir}; continuing without chattr`)
              return null
            }
            const chattrRes = await bchdSub.exec(['chattr', '-R', '+C', rootDir])
            if (chattrRes.exitCode !== 0) {
              console.warn(`nocow: chattr not applied for ${rootDir}; continuing startup`)
            }
            // Generate TLS certs if missing (BCHD requires them for the P2P
            // listener even when --notls is set for RPC).
            await bchdSub.exec([
              'sh', '-c',
              `test -f ${rootDir}/rpc.cert || gencerts --directory=${rootDir} --force`,
            ])
            // Strip any legacy `externalip[]=` lines from bchd.conf. BCHD
            // rejects these at config parse; we now pass --externalip via CLI
            // from the list maintained in store.json by watchHosts.
            await bchdSub.exec([
              'sh', '-c',
              `test -f ${rootDir}/bchd.conf && sed -i '/^externalip\\[\\]=/d' ${rootDir}/bchd.conf || true`,
            ])
          } catch (err) {
            console.warn('nocow: unable to set NoCOW attributes; continuing startup', err)
          }
          return null
        },
      },
      requires: [],
    })
    .addDaemon('primary', {
      subcontainer: bchdSub,
      exec: {
        command: ['bchd', ...bchdArgs],
        sigtermTimeout: 300_000,
      },
      ready: {
        display: 'RPC',
        fn: async () => {
          try {
            const res = await rpc('getinfo')
            return res.exitCode === 0
              ? { message: 'BCHD RPC is ready', result: 'success' }
              : { message: 'BCHD RPC is starting...', result: 'starting' }
          } catch {
            return { message: 'BCHD RPC is starting...', result: 'starting' }
          }
        },
      },
      requires: ['nocow'],
    })
    .addHealthCheck('sync-progress', {
      ready: {
        display: 'Blockchain Sync',
        fn: async () => {
          try {
            const res = await rpc('getblockchaininfo')
            if (res.exitCode !== 0)
              return { message: 'Waiting for sync info', result: 'loading' }
            const info = JSON.parse(res.stdout.toString()) as {
              blocks: number
              headers: number
              syncheight?: number
              mediantime?: number
              verificationprogress?: number
              initialblockdownload?: boolean
            }
            // BCHD omits verificationprogress & syncheight from JSON when
            // they are zero (Go omitempty). In JS, undefined < 0.999 is
            // false, so we must default to 0 to avoid a false "synced".
            const vp = info.verificationprogress ?? 0
            const syncHeight = info.syncheight ?? 0

            // Median-time staleness: mediantime is the median of the last
            // 11 blocks (~55 min behind for a fully-synced BCH node).
            // If it is more than 2 hours behind wall-clock, still syncing.
            const now = Math.floor(Date.now() / 1000)
            const medianAge = info.mediantime ? now - info.mediantime : Infinity
            const isStale = medianAge > 7200

            const isSyncing =
              info.initialblockdownload === true ||
              vp < 0.999 ||
              (syncHeight > 0 && info.blocks < syncHeight - 10) ||
              isStale
            if (isSyncing) {
              const pct = (vp * 100).toFixed(2)
              const target = syncHeight > 0 ? syncHeight : info.headers
              return {
                message: `Syncing blocks... ${pct}% (${info.blocks.toLocaleString()}/${target.toLocaleString()})`,
                result: 'loading',
              }
            }
            return {
              message: `Synced — block ${info.blocks.toLocaleString()}`,
              result: 'success',
            }
          } catch {
            return { message: 'Waiting for sync info', result: 'loading' }
          }
        },
      },
      requires: ['primary'],
    })
    .addOneshot('synced-true', {
      subcontainer: null,
      exec: {
        fn: async () => {
          const currentStore = await storeJson.read().once()
          if (!currentStore?.fullySynced) {
            await storeJson.merge(effects, { fullySynced: true })
          }
          return null
        },
      },
      requires: ['sync-progress'],
    })
    .addHealthCheck('peer-connections', {
      ready: {
        display: 'Peer Connections',
        fn: async () => {
          try {
            const res = await rpc('getpeerinfo')
            if (res.exitCode !== 0)
              return { message: 'Unable to query peers', result: 'loading' }
            const peers = JSON.parse(res.stdout.toString()) as Array<{
              inbound: boolean
            }>
            const count = peers.length
            if (count === 0)
              return {
                message: 'No peers connected — node may be starting up',
                result: 'loading',
              }
            if (count < 3)
              return {
                message: `Only ${count} peer(s) connected`,
                result: 'loading',
              }
            const inbound = peers.filter((p) => p.inbound).length
            return {
              message: `${count} peers (${count - inbound} outbound, ${inbound} inbound)`,
              result: 'success',
            }
          } catch {
            return { message: 'Unable to query peers', result: 'loading' }
          }
        },
      },
      requires: ['primary'],
    })
    .addHealthCheck('grpc', {
      ready: {
        display: 'gRPC',
        fn: async () => {
          if (!grpcEnabled) {
            return {
              result: 'disabled' as const,
              message: 'gRPC API is disabled — enable grpclisten in Node Settings to use it',
            }
          }
          try {
            return await grpcReady()
              ? { result: 'success' as const, message: `gRPC API is listening on port ${grpcPort}` }
              : { result: 'loading' as const, message: 'gRPC API is starting up...' }
          } catch {
            return { result: 'loading' as const, message: 'gRPC API is starting up...' }
          }
        },
      },
      requires: ['primary'],
    })
    .addHealthCheck('tor', {
      ready: {
        display: 'Tor',
        fn: () => {
          if (onionOnly && !torEnabled)
            return { result: 'failure' as const, message: 'Invalid config: onlynet=onion requires Tor routing enabled' }
          if (!torEnabled)
            return { result: 'disabled' as const, message: 'Tor proxy is disabled in config' }
          if (!torIp)
            return { result: 'disabled' as const, message: 'Tor is not installed' }
          if (!torRunning)
            return { result: 'disabled' as const, message: 'Tor is not running' }
          if (onlynetActive && !onlynetList.includes('onion'))
            return excludedByOnlynet()
          if (!fullySynced)
            return {
              result: 'loading' as const,
              message: 'Tor proxy configured — will activate automatically after initial block download completes (normal during first sync)',
            }
          return {
            result: 'success' as const,
            message: externalip.some((ip) => ip.includes('.onion'))
              ? store?.torIsolation
                ? 'Tor proxy active with stream isolation — inbound and outbound connections'
                : 'Tor proxy active — inbound and outbound connections'
              : store?.torIsolation
                ? 'Tor proxy active with stream isolation — outbound only. Add an onion address to enable inbound.'
                : 'Tor proxy active — outbound only. Add an onion address to enable inbound.',
          }
        },
      },
      requires: [],
    })
    .addHealthCheck('i2p', {
      ready: {
        display: 'I2P',
        fn: () => ({
          result: 'disabled' as const,
          message: 'I2P support is not implemented yet.',
        }),
      },
      requires: [],
    })
    .addHealthCheck('clearnet', {
      ready: {
        display: 'Clearnet',
        fn: () => {
          if (onlynetActive && !onlynetList.includes('ipv4') && !onlynetList.includes('ipv6'))
            return excludedByOnlynet()
          return {
            result: 'success' as const,
            message: externalip.some((ip) => ip && !ip.includes('.onion'))
              ? 'Inbound and outbound connections'
              : 'Outbound only. Publish an IP address to enable inbound.',
          }
        },
      },
      requires: [],
    })
})
