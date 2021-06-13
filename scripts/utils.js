const runScript = async (fn = async () => null) => {
  await fn()
  setInterval(() => null, 20000)
}

const runScriptAndExit = async (fn = async () => null) => {
  await fn()
  process.exit()
}

module.exports = { runScript }