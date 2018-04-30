import Gif from 'gif.js/dist/gif.js'
// eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
import GifWorker from '!!file-loader!gif.js/dist/gif.worker.js'

const createCanvas = ({ width, height }) => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return {
    canvas,
    context: canvas.getContext('2d')
  }
}

const scaleImage = (image, scale) => {
  const { width, height } = image
  const newSize = { width: width * scale, height: height * scale }
  const oldCanvas = createCanvas({ width, height })
  const newCanvas = createCanvas(newSize).context

  return (imageData) => {
    oldCanvas.context.putImageData(imageData, 0, 0)
    newCanvas.drawImage(oldCanvas.canvas, 0, 0, newSize.width, newSize.height)
    return newCanvas.getImageData(0, 0, newSize.width, newSize.height)
  }
}

const cropVideo = (video, scale) => {
  const { videoWidth, videoHeight } = video
  const videoSquare = Math.min(videoWidth, videoHeight)
  const canvasSize = videoSquare * scale
  const canvas = createCanvas({ width: canvasSize, height: canvasSize }).context

  return () => {
    canvas.drawImage(
      video,
      (videoWidth - videoSquare) / 2,
      (videoHeight - videoSquare) / 2,
      videoSquare,
      videoSquare,
      0,
      0,
      canvasSize,
      canvasSize
    )
    return canvas.getImageData(0, 0, canvasSize, canvasSize)
  }
}

const createGif = ({
  video,
  onStart,
  onProgress,
  onFinished,
  onFrame,
  maxLength = 2000,
  minLength = 200,
  fps = 10,
  scale = 0.75,
  maxSize = 2e6,
  maxAttempts = 2
}) => {
  let startTime, currentTime, minTimeout, captureInterval
  let attempts = 0
  let frames = []

  const gif = new Gif({
    workerScript: GifWorker,
    workers: 4,
    quality: 10
  })

  gif.on('progress', (progress) => onProgress({ progress, attempts }))
  gif.on('finished', (image) => {
    if (image.size > maxSize && attempts < maxAttempts) {
      rerender(scale * (2 / 3))
    } else {
      // gif.js turns this on when rendering but not off when finished
      gif.running = false
      resetState()
      resetGif()
      onFinished({ image })
    }
  })

  const resetGif = () => {
    // Reset gif state so we can reuse the object and get the same event emitters
    gif.setOptions({ width: null, height: null })
    gif.frames = []
    gif.freeWorkers = []
    gif.activeWorkers = []
  }

  const resetState = () => {
    cleanUp()
    frames = []
    attempts = 0
    startTime = null
    currentTime = null
  }

  const render = () => {
    cleanUp()
    attempts++
    gif.render()
  }

  const start = () => {
    startTime = Date.now()
    currentTime = startTime

    const cropFrame = cropVideo(video, scale)

    captureInterval = setInterval(() => {
      const now = Date.now()
      const delay = now - currentTime
      currentTime = now

      if (currentTime - startTime > maxLength) {
        return stop()
      }

      const frame = cropFrame()
      frames.push({ frame, delay })

      onFrame({
        current: currentTime,
        progress: (currentTime - startTime) / maxLength
      })

      gif.addFrame(frame, { delay })
    }, 1000 / fps)

    onStart({ time: startTime })
  }

  const rerender = (scale) => {
    const scaleFrame = scaleImage(frames[0].frame, scale)

    // Reset gif state so we can reuse the object and get the same event emitters
    resetGif()

    frames.forEach((data) =>
      gif.addFrame(scaleFrame(data.frame), { delay: data.delay })
    )
    render()
  }

  const cleanUp = () => {
    gif.abort()
    clearInterval(captureInterval)
    clearTimeout(minTimeout)
    captureInterval = null
    minTimeout = null
  }

  const stop = () => {
    if (gif.running) return

    // Re-call stop in the event of a quick tap after the minimum length has passed
    if (currentTime - startTime < minLength) {
      if (!minTimeout) {
        minTimeout = setTimeout(stop, minLength - (currentTime - startTime))
      }
      return
    }

    render()
  }

  return {
    isRunning: () => gif.running,
    start,
    stop,
    cleanUp
  }
}

export default createGif
