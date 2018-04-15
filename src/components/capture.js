/* eslint-disable jsx-a11y/media-has-caption */

import { h, Component } from 'preact'
import cx from 'classnames'
import gif from '../lib/gif'
import styles from './capture.css'

const ms = (fps) => 1000 / fps

export default class Home extends Component {
  state = {
    error: null,
    stream: null,
    start: 0,
    current: 0,
    progress: null
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
    navigator.mediaDevices
      .getUserMedia({ audio: false, video: { facingMode: 'user' } })
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
        this.setState({ error: error.message })
      })
  }

  componentWillUnmount() {
    clearInterval(this._canvasInterval)
    clearInterval(this._captureInterval)
    clearTimeout(this._minTimeout)
  }

  componentDidUpdate() {
    const { clientHeight } = this._video || {}
    if (clientHeight) {
      this._videoHeight = clientHeight
    }
  }

  setImage = ({ image = null, now = 0 } = {}) => {
    const { onChange } = this.props
    onChange({ image })
    this.setState({ start: now, current: now, progress: null })
  }

  startCapture = (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) {
      return
    }

    e.preventDefault()

    const { maxLength, gifFps, gifQuality, onChange } = this.props
    const { start } = this.state

    // Dont start multiple recordings
    console.log({ start })
    if (start) return

    this._gif = gif({
      height: this._canvas.height,
      width: this._canvas.width,
      quality: gifQuality
    })

    this._gif.on('progress', (progress) => this.setState({ progress }))
    this._gif.on('finished', (image) => this.setImage({ image, now: 0 }))

    this.setImage({ image: null, now: Date.now() })

    this._captureInterval = setInterval(() => {
      const now = Date.now()

      const { start } = this.state

      if (start && now - start > maxLength) {
        return this.stopCapture()
      }

      this.setState({ current: now })
      this._gif.addFrame(this._canvas, { copy: true, delay: ms(gifFps) })
    }, ms(gifFps))
  }

  stopCapture = () => {
    const { minLength } = this.props
    const { start, current } = this.state

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

  render({ image, maxLength }, { error, stream, progress, start, current }) {
    const hasProgress = typeof progress === 'number'

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
                style={{ display: image || hasProgress ? 'none' : 'block' }}
                ref={(c) => (this._video = c)}
                autoplay
                muted
                playsinline
                srcObject={stream}
                playsinline
              />
              {!image &&
                hasProgress && (
                  <div
                    class={styles.renderProgress}
                    style={{ height: this._videoHeight }}
                  >
                    {(progress * 100).toFixed(0)}%
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
                !hasProgress && (
                  <div
                    class={styles.captureProgress}
                    style={{
                      width: `${100 * ((current - start) / maxLength)}%`
                    }}
                  />
                )}
            </div>
            {!image &&
              !hasProgress && (
                <button
                  class={cx(styles.btnCapture, {
                    [styles.btnRecording]: !!start
                  })}
                  onMouseDown={this.startCapture}
                  onMouseUp={this.stopCapture}
                  onTouchStart={this.startCapture}
                  onTouchEnd={this.stopCapture}
                >
                  {start ? 'Recording' : 'Hold to record'}
                </button>
              )}
            {!image &&
              hasProgress && (
                <button class={styles.btnCapture} disabled>
                  Rendering
                </button>
              )}
            {image && (
              <button
                class={styles.btnCapture}
                onClick={() => this.setImage({ image: null, now: 0 })}
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
