/**
 * Spawns a bootstrap node + N peer processes and logs their output.
 * Usage: bun run swarm.ts [peerCount]
 */

const PEER_COUNT = parseInt(process.argv[2] || '10')
const BOOTSTRAP_HOST = '127.0.0.1'
const BOOTSTRAP_PORT = '9000'
const RUN_DURATION = 30_000

const procs: ReturnType<typeof Bun.spawn>[] = []

console.log(`[swarm] Starting bootstrap on ${BOOTSTRAP_HOST}:${BOOTSTRAP_PORT}`)
const bootstrap = Bun.spawn(['bun', 'run', 'bootstrap.ts'], {
    env: { ...process.env, BOOTSTRAP_HOST, BOOTSTRAP_PORT },
    stdout: 'inherit',
    stderr: 'inherit',
})
procs.push(bootstrap)

await Bun.sleep(500)

for (let i = 0; i < PEER_COUNT; i++) {
    console.log(`[swarm] Starting peer ${i + 1}/${PEER_COUNT}`)
    const peer = Bun.spawn(['bun', 'run', 'index.ts'], {
        env: { ...process.env, BOOTSTRAP_HOST, BOOTSTRAP_PORT },
        stdout: 'inherit',
        stderr: 'inherit',
    })
    procs.push(peer)
    await Bun.sleep(500)
}

console.log(`[swarm] All ${PEER_COUNT} peers launched. Running for ${RUN_DURATION / 1000}s...`)

await Bun.sleep(RUN_DURATION)

console.log('[swarm] Shutting down...')
for (const proc of procs) {
    proc.kill('SIGINT')
}

await Bun.sleep(1000)
for (const proc of procs) {
    proc.kill('SIGKILL')
}

console.log('[swarm] Done.')
process.exit(0)
