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
    .map(([name, raw]) => ({
      name,
      size: pb(+raw),
      raw: +raw
    }))

  const total = files.reduce((m, { raw }) => m + raw, 0)
  return {
    params,
    total: { raw: total, size: pb(total) },
    files
  }
}

const main = async (...flags) => {
  const builds = combinations(flags).map((b) =>
    b.map((v, i) => `${flags[i]}=${v}`).join(' ')
  )

  const results = []
  for (const build of builds) results.push(await buildAndSize(build))
  results.sort((a, b) => a.total.raw - b.total.raw)

  process.stdout.write(JSON.stringify(results, null, 2))
}

main('USE_ES6', 'USE_OBJ_ASSIGN', 'USE_ASYNC_ROUTES')
