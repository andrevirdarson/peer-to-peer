# peer-to-peer

A UDP-based peer-to-peer networking system built with Bun. Peers discover each other through a centralized bootstrap server and maintain direct connections using a custom binary envelope protocol.

## How it works

### Bootstrap server

The bootstrap server is the entry point to the network. When a new peer joins, it sends a `DISCOVERY` message to the bootstrap server. The bootstrap server introduces the new peer to all known peers (and vice versa), then steps out of the way. It does not relay messages — peers talk directly to each other after discovery.

### Peers

Once a peer has discovered others through bootstrap, it communicates directly via UDP. Each peer maintains a local map of known peers and their liveness.

### Heartbeat

Peers send periodic `HEARTBEAT` messages to all known peers and to the bootstrap server. Any node that hasn't sent a heartbeat within the timeout window is considered dead and removed. This is necessary because UDP's `send()` succeeds even if the recipient is gone — there's no connection state to detect failures.

### Envelope protocol

All messages use a compact binary envelope format:

```
[type: 1 byte][payload length: 2 bytes][payload: N bytes]
```

Header is 3 bytes. Message types are `DISCOVERY` (0x01) and `HEARTBEAT` (0x02).

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

## TODO

- [ ] Gossip protocol — epidemic message propagation with fan-out, seen set for deduplication, and TTL-based expiry of seen messages
