/* eslint-disable jsx-a11y/media-has-caption */

import { h, Component } from 'preact'
import getUserMedia from 'getusermedia'
import gif from '../lib/gif'

const ms = (fps) => 1000 / fps

export default class Home extends Component {
  state = {
    error: null,
    captureStart: 0,
    captureCurrent: 0,
    progress: 0
  }

  static defaultProps = {
    image: null,
    maxLength: 3000,
    minLength: 1000,
    width: 640,
    height: 480,
    canvasFps: 60,
    gifQuality: 10, // lower is better
    gifFps: 10,
    onChange: () => {}
  }

  componentDidMount() {
    getUserMedia(
      {
        video: true,
        audio: false
      },
      (err, stream) => {
        if (err) {
          this.setState({ error: err })
          return
        }

        const { _video: video, _canvas: canvas } = this
        const { canvasFps, width, height } = this.props
        const context = canvas.getContext('2d')
        video.src = URL.createObjectURL(stream)

        // Thanks, Phil!
        this._canvasInterval = setInterval(function() {
          context.drawImage(video, 0, 0, width, height)
          video.play()
        }, ms(canvasFps))
      }
    )
  }

  componentWillUnmount() {
    clearInterval(this._canvasInterval)
    clearInterval(this._captureInterval)
    clearInterval(this._progressInterval)
    clearTimeout(this._minTimeout)
  }

  startCapture = (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) {
      return
    }

    const {
      maxLength,
      gifFps,
      canvasFps,
      height,
      width,
      gifQuality,
      onChange
    } = this.props

    this._gif = gif({
      height,
      width,
      quality: gifQuality
    })

    this._gif.on('progress', (progress) => this.setState({ progress }))
    this._gif.on('finished', (image) => onChange({ image }))

    onChange({ image: null })
    const now = Date.now()
    this.setState({ progress: 0, captureStart: now, captureCurrent: now })

    this._captureInterval = setInterval(() => {
      const { captureStart: start, captureCurrent: current } = this.state

      if (start && current - start > maxLength) {
        return this.stopCapture()
      }

      this._gif.addFrame(this._canvas, { copy: true, delay: ms(gifFps) })
    }, ms(gifFps))

    // Seperate interval for progress bar so that it updates more smoothly than
    // the slower gif frames per second rate
    this._progressInterval = setInterval(() => {
      this.setState({ captureCurrent: Date.now() })
    }, ms(canvasFps))
  }

  stopCapture = () => {
    const { minLength } = this.props
    const { captureStart: start, captureCurrent: current } = this.state

    // Re-call stopCapture in the event of a quick tap after the minimum length
    // has passed
    if (current - start < minLength) {
      this._minTimeout = setTimeout(
        this.stopCapture,
        minLength - (current - start)
      )
      return
    }

    clearInterval(this._captureInterval)
    clearInterval(this._progressInterval)

    this.setState({ captureStart: 0, captureCurrent: 0, progress: 0 })

    this._gif.running = false
    this._gif.render()
  }

  render(
    { height, width, image, maxLength },
    { error, progress, captureStart, captureCurrent }
  ) {
    return (
      <div style={{ position: 'relative' }}>
        {error ? (
          <div>{error.message}</div>
        ) : (
          <span>
            <video ref={(c) => (this._video = c)} style={{ display: 'none' }} />
            {image ? (
              <img alt="Your mug!" src={URL.createObjectURL(image)} />
            ) : (
              <span>
                <canvas
                  ref={(c) => (this._canvas = c)}
                  style={{
                    width: '100%'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    height: 20,
                    background: 'blue',
                    width: `${100 *
                      ((captureCurrent - captureStart) / maxLength)}%`
                  }}
                />
                {progress && (
                  <div
                    style={{
                      width,
                      height,
                      background: '#ccc'
                    }}
                  >
                    {(progress * 100).toFixed(0)}%
                  </div>
                )}
              </span>
            )}
          </span>
        )}
      </div>
    )
  }
}
