import { sdk } from './sdk'
import { rootDir, rpcPort } from './utils'
import { bchdConf } from './file-models/bchd.conf'
import { storeJson } from './file-models/store.json'

export const main = sdk.setupMain(async ({ effects }) => {
  console.log('Starting BCHD!')

  const conf = await bchdConf.read().const(effects)
  const store = await storeJson.read().once()
  const activeCred = store?.rpcCredentials?.[0]
  const rpcUser = activeCred?.username ?? store?.rpcUser ?? 'bchd'
  const rpcPassword = activeCred?.password ?? store?.rpcPassword ?? ''
  const torEnabled = store?.torEnabled ?? true

  const grpcEnabled = (conf?.grpclisten ?? '') !== ''
  const onlynetList = ((conf?.onlynet as string[] | undefined) ?? []).filter(Boolean)
  const onionOnly = onlynetList.length > 0 && onlynetList.every((n) => n === 'onion')

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
    `--listen=0.0.0.0:8333`,
  ]

  // Apply onlynet restrictions only when explicitly narrowed from default-all.
  for (const net of onlynetList) {
    bchdArgs.push(`--onlynet=${net}`)
  }

  // txindex / addrindex (conditional)
  if (conf?.txindex === 1 || conf?.txindex === true) {
    bchdArgs.push('--txindex')
    bchdArgs.push('--addrindex')
  }

  const fullySynced = store?.fullySynced ?? false

  // Tor proxy args — skipped during IBD to avoid crippling sync speed
  if (torIp && fullySynced) {
    bchdArgs.push(`--proxy=${torIp}:9050`)
    bchdArgs.push(`--onion=${torIp}:9050`)
    if (store?.torIsolation) {
      bchdArgs.push('--torisolation')
    }
  } else if (torEnabled && !fullySynced) {
    console.log('Tor routing deferred until initial block download completes')
  }

  if (grpcEnabled) {
    bchdArgs.push('--grpclisten=0.0.0.0:8335')
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

  const mounts = sdk.Mounts.of().mountVolume({
    volumeId: 'main',
    subpath: null,
    mountpoint: rootDir,
    readonly: false,
  })

  const bchdSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'bchd' },
    mounts,
    'bchd-sub',
  )

  // Generate TLS certs if missing (BCHD needs them even with --notls)
  await bchdSub.exec([
    'sh', '-c',
    `test -f ${rootDir}/rpc.cert || gencerts --directory=${rootDir} --force`,
  ])

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

  return sdk.Daemons.of(effects)
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
      requires: [],
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
    .addHealthCheck('tor', {
      ready: {
        display: 'Tor',
        fn: () => {
          if (onionOnly && !torEnabled)
            return { result: 'failure' as const, message: 'Invalid config: onlynet=onion requires Tor routing enabled' }
          if (!torEnabled)
            return { result: 'disabled' as const, message: 'Tor routing is disabled in config' }
          if (!torIp)
            return { result: 'disabled' as const, message: 'Tor is not installed' }
          if (!torRunning)
            return { result: 'disabled' as const, message: 'Tor is not running' }
          if (!fullySynced)
            return {
              result: 'loading' as const,
              message: 'Tor routing will activate after initial block download',
            }
          return {
            result: 'success' as const,
            message: store?.torIsolation
              ? 'Tor proxy active with stream isolation'
              : 'Tor proxy active',
          }
        },
      },
      requires: [],
    })
    .addHealthCheck('clearnet', {
      ready: {
        display: 'Clearnet',
        fn: () => {
          if (onionOnly) {
            return {
              result: 'disabled' as const,
              message: 'Clearnet disabled — onlynet=onion is set',
            }
          }
          if (torEnabled && torIp) {
            return {
              result: 'success' as const,
              message: 'Outbound via Tor proxy with clearnet still allowed',
            }
          }
          return {
            result: 'success' as const,
            message: 'Direct clearnet connections',
          }
        },
      },
      requires: [],
    })
})
