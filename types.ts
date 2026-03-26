export type Peer = {
    address: string
    port: number
    lastSeen: number
}

export const MESSAGE_TYPE = {
    DISCOVERY: 0x01,
    HEARTBEAT: 0x02,
} as const;

export type EnvelopeType = keyof typeof MESSAGE_TYPE;

export type Envelope = {
    type: EnvelopeType
    payload?: Uint8Array;
}

export function toPeerId(peer: Peer): string
export function toPeerId(address: string, port: number): string
export function toPeerId(peerOrAddress: Peer | string, port?: number) {
    if (typeof peerOrAddress === 'string') {
        return `${peerOrAddress}:${port}`
    }
    return `${peerOrAddress.address}:${peerOrAddress.port}`
}
