/* eslint-disable jsx-a11y/media-has-caption */

import { h, Component } from 'preact'
import cx from 'classnames'
import gif from '../lib/gif'
import keyBinding from '../lib/keyBindings'
import styles from './capture.css'

const ms = (fps) => 1000 / fps

const R_KEY = 'r'

export default class Home extends Component {
  state = {
    error: null,
    stream: null,
    captureStart: 0,
    captureCurrent: 0,
    renderProgress: 0
  }

  static defaultProps = {
    image: null,
    maxLength: 3000,
    minLength: 1000,
    gifQuality: 10, // lower is better
    gifFps: 10,
    onChange: () => {}
  }

  componentDidMount() {
    this._spaceBarTrigger = keyBinding('keypress', R_KEY, this.startCapture)
    navigator.mediaDevices
      .getUserMedia({ audio: false, video: true })
      .then((stream) => {
        this.setState({ stream })

        // This allows for ref callbacks to be called first so they are available
        setTimeout(() => {
          const { _video: video, _canvas: canvas } = this
          const context = canvas.getContext('2d')

          // // Thanks, Phil!
          this._canvasInterval = setInterval(function() {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight

            this._height = video.clientHeight

            context.drawImage(video, 0, 0, canvas.width, canvas.height)
            video.play()
          }, ms(60))
        }, 0)
      })
      .catch((error) => {
        this.setState({ error: `Video ${error.message.toLowerCase()}` })
      })
  }

  componentWillUnmount() {
    clearInterval(this._canvasInterval)
    clearInterval(this._captureInterval)
    clearTimeout(this._minTimeout)
    this._spaceBarTrigger()
  }

  componentDidUpdate() {
    const { clientHeight } = this._video || {}
    if (clientHeight) {
      this._videoHeight = clientHeight
    }
  }

  setImage = (image) => {
    const { onChange } = this.props
    onChange({ image })
    this.setState({ captureStart: 0, captureCurrent: 0, renderProgress: 0 })
  }

  startCapture = (e) => {
    if (
      e.altKey ||
      e.ctrlKey ||
      e.metaKey ||
      e.shiftKey ||
      (e.key && e.key !== R_KEY) ||
      (e.button !== undefined && e.button !== 0)
    ) {
      return
    }

    const { maxLength, gifFps, gifQuality, onChange } = this.props
    const { captureStart } = this.state

    if (captureStart) return this.stopCapture()

    this._gif = gif({
      height: this._canvas.height,
      width: this._canvas.width,
      quality: gifQuality
    })

    this._gif.on('progress', (renderProgress) =>
      this.setState({ renderProgress })
    )
    this._gif.on('finished', this.setImage)

    onChange({ image: null })
    const now = Date.now()
    this.setState({ renderProgress: 0, captureStart: now, captureCurrent: now })

    this._captureInterval = setInterval(() => {
      const now = Date.now()

      const { captureStart: start } = this.state

      if (start && now - start > maxLength) {
        return this.stopCapture()
      }

      this.setState({ captureCurrent: now })
      this._gif.addFrame(this._canvas, { copy: true, delay: ms(gifFps) })
    }, ms(gifFps))
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

    this._gif.running = false
    this._gif.render()
  }

  render(
    { image, maxLength },
    { error, stream, renderProgress, captureStart, captureCurrent }
  ) {
    return (
      <div class={styles.container}>
        {!stream && !error ? (
          <div class={styles.initial}>Grant camera access</div>
        ) : error ? (
          <div class={styles.error}>{error}</div>
        ) : (
          <div>
            <canvas
              ref={(c) => (this._canvas = c)}
              style={{ display: 'none' }}
            />
            <div class={styles.mediaContainer}>
              <video
                class={styles.video}
                style={{ display: image || renderProgress ? 'none' : 'block' }}
                ref={(c) => (this._video = c)}
                srcObject={stream}
              />
              {!image &&
                renderProgress > 0 && (
                  <div
                    class={styles.renderProgress}
                    style={{ height: this._videoHeight }}
                  >
                    {(renderProgress * 100).toFixed(0)}%
                  </div>
                )}
              {image && (
                <img
                  class={styles.image}
                  alt="Your mug!"
                  style={{ height: this._videoHeight }}
                  src={URL.createObjectURL(image)}
                />
              )}
              {!image &&
                !renderProgress && (
                  <div
                    class={styles.captureProgress}
                    style={{
                      width: `${100 *
                        ((captureCurrent - captureStart) / maxLength)}%`
                    }}
                  />
                )}
            </div>
            {!image &&
              !renderProgress && (
                <button
                  class={cx(styles.btnCapture, {
                    [styles.btnRecording]: !!captureStart
                  })}
                  onMouseDown={this.startCapture}
                  onMouseUp={this.stopCapture}
                >
                  {captureStart ? 'Recording' : 'Hold to record'}
                </button>
              )}
            {!image &&
              renderProgress > 0 && (
                <button class={styles.btnCapture} disabled>
                  Rendering
                </button>
              )}
            {image && (
              <button
                class={styles.btnCapture}
                onClick={() => this.setImage(null)}
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>
    )
  }
}
