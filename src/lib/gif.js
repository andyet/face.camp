import Gif from 'gif.js/dist/gif.js'
// eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
import GifWorker from 'file-loader?name=gif.worker.js!gif.js/dist/gif.worker.js'
// TODO might not need file loader name param

export default (options = {}) =>
  new Gif({
    workerScript: GifWorker,
    workers: 4,
    ...options
  })
