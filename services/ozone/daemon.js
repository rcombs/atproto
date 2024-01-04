'use strict' /* eslint-disable */

require('dd-trace/init') // Only works with commonjs

// Tracer code above must come before anything else
const {
  OzoneDaemon,
  envToCfg,
  envToSecrets,
  readEnv,
} = require('@atproto/ozone')

const main = async () => {
  const env = readEnv()
  env.version ??= package.version
  const cfg = envToCfg(env)
  const secrets = envToSecrets(env)
  const daemon = await OzoneDaemon.create(cfg, secrets)

  await daemon.start()
  process.on('SIGTERM', async () => {
    await daemon.destroy()
  })
}

main()
