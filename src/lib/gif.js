import Gif from 'gif.js/dist/gif.js'
// eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
import GifWorker from '!!file-loader!gif.js/dist/gif.worker.js'

export default (options = {}) =>
  new Gif({
    workerScript: GifWorker,
    workers: 4,
    ...options
  })
