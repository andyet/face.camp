/* eslint-disable import/unambiguous */

const cp = require('child_process')
const pb = require('pretty-bytes')

const combinations = (n) =>
  [...Array(2 ** n.length)].map((__, y) =>
    [...Array(n.length)].map((__, x) => Boolean((y >> x) & 1))
  )

const promiseSerial = (fns) =>
  fns.reduce(
    (p, fn) => p.then((r) => fn().then(Array.prototype.concat.bind(r))),
    Promise.resolve([])
  )

const exec = (...args) =>
  new Promise((resolve, reject) =>
    cp.exec(...args, (err, stdout) => {
      if (err) return reject(err)
      resolve(stdout.trim().split('\n'))
    })
  )

const buildAndSize = (params) => () =>
  exec(`${params} npm run build`)
    .then(() => exec('npm run build:size -s'))
    .then((lines) => {
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
    })

const FLAGS = ['USE_ES6', 'USE_OBJ_ASSIGN', 'USE_ASYNC_ROUTES']

const builds = combinations(FLAGS)
  .map((b) => b.map((v, i) => `${FLAGS[i]}=${v}`).join(' '))
  .map(buildAndSize)

promiseSerial(builds).then((r) =>
  process.stdout.write(
    JSON.stringify(r.sort((a, b) => a.total.raw - b.total.raw), null, 2)
  )
)
