/* eslint-disable import/unambiguous */

const cp = require('child_process')
const pb = require('pretty-bytes')

const combinations = (n) =>
  [...Array(2 ** n.length)].map((__, y) =>
    [...Array(n.length)].map((__, x) => Boolean((y >> x) & 1))
  )

const exec = (...args) =>
  new Promise((resolve, reject) =>
    cp.exec(...args, (err, stdout) => {
      if (err) return reject(err)
      resolve(stdout.trim().split('\n'))
    })
  )

const buildAndSize = async (params) => {
  await exec(`${params} npm run build`)
  const lines = await exec('npm run build:size -s')

  const files = lines
    .map((line) => line.replace('build/', '').split(' - '))
    .filter(
      ([name]) =>
        !name.startsWith('precache-manifest') && !name.startsWith('sw')
    )
    .map(([name, raw]) => ({
      name,
      isJs:
        !name.endsWith('.esm.js') &&
        !!(
          name.startsWith('route-') ||
          name.startsWith('bundle.') ||
          name.match(/^\d+\.chunk/)
        ),
      isEsm: name.endsWith('.esm.js'),
      size: pb(+raw),
      raw: +raw
    }))

  const [js, esm, other] = files.reduce(
    (acc, file) => {
      acc[file.isJs ? 0 : file.isEsm ? 1 : 2].push(file)
      return acc
    },
    [[], [], []]
  )

  const totalJs = js.reduce((m, { raw }) => m + raw, 0)
  const totalEsm = esm.reduce((m, { raw }) => m + raw, 0)
  const totalOther = other.reduce((m, { raw }) => m + raw, 0)
  return {
    params,
    totalJs: { raw: totalJs + totalOther, size: pb(totalJs + totalOther) },
    totalEsm: { raw: totalEsm + totalOther, size: pb(totalEsm + totalOther) },
    files
  }
}

const main = async (flags) => {
  const builds = combinations(flags).map((b) =>
    b.map((v, i) => `${flags[i]}=${v}`).join(' ')
  )

  const results = []
  for (const build of builds) results.push(await buildAndSize(build))
  results.sort((a, b) => a.totalJs.raw - b.totalJs.raw)

  process.stdout.write(JSON.stringify(results, null, 2))
}

const argv = process.argv.slice(2)
const defaultFlags = ['USE_ES6', 'USE_OBJ_ASSIGN', 'USE_ASYNC_AWAIT']

main(argv.length ? argv : defaultFlags)
