import { log } from "./log"
import { decode, encode } from "./serializer"
import { toPeerId, type Peer } from "./types"

const BOOTSTRAP_FANOUT = 3

const peers = new Map<string, Peer>()

const socket = await Bun.udpSocket({
    hostname: process.env.BOOTSTRAP_HOST,
    port: process.env.BOOTSTRAP_PORT,
    socket: {
        data(socket, buffer, port, address) {
            const envelope = decode(buffer)
            
            if (envelope.type === 'DISCOVERY') {
                const peerId = toPeerId(address, port)
                log(envelope.type, `from ${peerId}`)
    
                const sample = [...peers.values()]
                    .sort(() => Math.random() - 0.5)
                    .slice(0, BOOTSTRAP_FANOUT)
                for (const peer of sample) {
                    // Tell existing peer about new peer
                    socket.send(encode('DISCOVERY', { address, port }), peer.port, peer.address)
                    // Tell new peer about existing peer
                    socket.send(encode('DISCOVERY', { address: peer.address, port: peer.port }), port, address)
                }
    
                peers.set(peerId, { address, port, lastSeen: Date.now() })
    
                log(envelope.type, `known peers: ${peers.size}`)
            } else if (envelope.type === 'HEARTBEAT') {
                const peerId = toPeerId(address, port)
                const peer = peers.get(peerId)
                if (peer) {
                    peer.lastSeen = Date.now()
                }
            }
        },
    },
})

log('STARTUP', `Bootstrapper started on ${socket.hostname}:${socket.port}`)

process.on('SIGINT', () => {
    log('SHUTDOWN', 'Shutting down bootstrap server...')
    socket.close()
    process.exit(0)
})

const PEER_TIMEOUT = 30_000
const PEER_CLEANUP_INTERVAL = 10_000

setInterval(() => {
    const now = Date.now()
    for (const [id, peer] of peers) {
        if (now - peer.lastSeen > PEER_TIMEOUT) {
            log('CLEANUP', `removing stale peer ${id} from bootstrap`)
            peers.delete(id)
        }
    }
}, PEER_CLEANUP_INTERVAL)
