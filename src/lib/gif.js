import Gif from 'gif.js/dist/gif.js'
// eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
import GifWorker from '!!file-loader!gif.js/dist/gif.worker.js'

const createGif = ({
  video,
  onStart,
  onProgress,
  onFinished,
  onFrame,
  maxLength = 3000,
  minLength = 200,
  fps = 10,
  quality = 10,
  scale = 1
}) => {
  const start = Date.now()
  let current = start
  let minTimeout

  const canvas = document.createElement('canvas')

  const square = Math.min(video.videoWidth, video.videoHeight)
  canvas.width = square * scale
  canvas.height = square * scale
  const context = canvas.getContext('2d')

  const gif = new Gif({
    workerScript: GifWorker,
    workers: 4,
    height: canvas.height,
    width: canvas.width,
    quality
  })

  gif.on('progress', onProgress)
  gif.on('finished', (image) => {
    // gif.js turns this on when rendering but not off when finished
    gif.running = false
    onFinished(image)
  })

  const stop = () => {
    if (gif.running) return

    // Re-call stop in the event of a quick tap after the minimum length has passed
    if (current - start < minLength && !minTimeout) {
      minTimeout = setTimeout(() => {
        stop()
        this._minTimeout = null
      }, minLength - (current - start))
      return
    }

    gif.render()
  }

  const interval = setInterval(() => {
    current = Date.now()

    if (start && current - start > maxLength) {
      return stop()
    }

    onFrame({ current, progress: (current - start) / maxLength })

    context.drawImage(
      video,
      (video.videoWidth - canvas.width) / 2,
      (video.videoHeight - canvas.height) / 2,
      canvas.width,
      canvas.height,
      0,
      0,
      canvas.width,
      canvas.height
    )

    gif.addFrame(context.getImageData(0, 0, canvas.width, canvas.height), {
      delay: 1000 / fps
    })
  }, 1000 / fps)

  gif.cleanUp = () => {
    clearInterval(interval)
    clearTimeout(minTimeout)
  }

  const _render = gif.render
  gif.render = () => {
    if (gif.running) return
    gif.cleanUp()
    _render.call(gif)
  }

  onStart(start)

  return gif
}

export default createGif
