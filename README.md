# peer-to-peer

A UDP-based peer-to-peer networking system built with Bun. Peers discover each other through a bootstrap server and propagate knowledge of new peers to the rest of the network via gossip.

## How it works

### Bootstrap server

The bootstrap server is the entry point to the network. When a new peer joins, it sends a `DISCOVERY` message to the bootstrap. The bootstrap introduces the new peer to a random sample of known peers (fanout = 3) and vice versa, then steps out of the way. It does not relay messages — peers communicate directly after discovery.

### Gossip discovery

When a peer learns about a new peer (from bootstrap or from another peer), it forwards that `DISCOVERY` to all its own known peers. Those peers do the same, propagating the new peer's existence throughout the network. A deduplication guard prevents forwarding loops — each peer only forwards a discovery once.

This means the network converges to full connectivity without any central coordinator after the initial bootstrap introduction.

### Heartbeat

Peers send periodic `HEARTBEAT` messages to all known peers and to the bootstrap server. Any node that hasn't sent a heartbeat within the timeout window is considered dead and removed. This is necessary because UDP's `send()` succeeds even if the recipient is gone — there's no connection state to detect failures.

### Serialization

All messages are serialized with [MessagePack](https://msgpack.org/) and wrapped in a typed envelope:

```ts
{ type: EnvelopeType, payload: T }
```

Message types: `DISCOVERY` (0x01), `HEARTBEAT` (0x02).

## Running

```bash
bun install
```

Start the bootstrap server:
```bash
BOOTSTRAP_HOST=127.0.0.1 BOOTSTRAP_PORT=4000 bun run bootstrap.ts
```

Start a peer:
```bash
BOOTSTRAP_HOST=127.0.0.1 BOOTSTRAP_PORT=4000 bun run index.ts
```

Run a local swarm (spawns bootstrap + N peers):
```bash
bun run swarm.ts 10
```

## TODO

- [ ] MESSAGE + ACK — data propagation with quorum tracking
- [ ] Key-value gossip state with version vectors
- [ ] TTL / expiry on gossip entries
- [ ] Pull-based anti-entropy repair
