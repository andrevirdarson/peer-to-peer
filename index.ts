import { log } from "./log"
import { decode, encode } from "./serializer"
import { toPeerId, type DiscoveryEnvelope, type Peer } from "./types"

const peers = new Map<string, Peer>()

const socket = await Bun.udpSocket({
    socket: {
        data(socket, buffer, port, address) {
            const envelope = decode(buffer)

            if (envelope.type === 'DISCOVERY') {
                const { payload } = envelope as DiscoveryEnvelope
                const peer = {
                    address: payload.address,
                    port: payload.port,
                    lastSeen: Date.now()
                }
                const peerId = toPeerId(peer)

                if (peers.has(peerId)) return

                for (const p of peers.values()) {
                    // Tell existing peer about new peer
                    socket.send(encode('DISCOVERY', { address: peer.address, port: peer.port }), p.port, p.address)
                    // Tell new peer about existing peer
                    socket.send(encode('DISCOVERY', { address: p.address, port: p.port }), peer.port, peer.address)
                }

                peers.set(peerId, peer)
                log(envelope.type, `from ${peerId}`)
            } else if (envelope.type === 'HEARTBEAT') {
                const peerId = toPeerId(address, port)
                log(envelope.type, `from ${peerId}`)

                const peer = peers.get(peerId)
                if (peer) {
                    peer.lastSeen = Date.now()
                }
            }
        },
    },
})

log('STARTUP', `port ${socket.port}`)
const envelope = encode('DISCOVERY')
socket.send(envelope, process.env.BOOTSTRAP_PORT, process.env.BOOTSTRAP_HOST)
log('DISCOVERY', 'sent discovery to bootstrap')

process.on('SIGINT', () => {
    log('SHUTDOWN', 'Shutting down peer...')
    socket.close()
    process.exit(0)
})

const HEARTBEAT_INTERVAL = 3000

setInterval(() => {
    for (const peer of peers.values()) {
        socket.send(encode('HEARTBEAT'), peer.port, peer.address)
    }
    socket.send(encode('HEARTBEAT'), process.env.BOOTSTRAP_PORT, process.env.BOOTSTRAP_HOST)
}, HEARTBEAT_INTERVAL)

const PEER_TIMEOUT = 15_000
const PEER_CLEANUP_INTERVAL = 10_000

setInterval(() => {
    const now = Date.now()
    for (const [id, peer] of peers) {
        if (now - peer.lastSeen > PEER_TIMEOUT) {
            log('CLEANUP', `removing stale peer ${id}`)
            peers.delete(id)
        }
    }
}, PEER_CLEANUP_INTERVAL)
