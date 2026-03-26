import type { EnvelopeType } from "./types"

type LogTag = EnvelopeType | 'CLEANUP' | 'STARTUP' | 'SHUTDOWN'

export function log(tag: LogTag, message: string) {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
    console.log(`${now} [${tag}] ${message}`)
}