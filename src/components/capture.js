/* eslint-disable jsx-a11y/media-has-caption */

import { h, Component } from 'preact'
import cx from 'classnames'
import BlobImage from './blob-image'
import gif from '../lib/gif'
import keyBinding from '../lib/keyBindings'
import styles from './capture.css'

const noop = () => {}
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
    readonly: false,
    image: null,
    maxLength: 3000,
    minLength: 300,
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
            context.drawImage(video, 0, 0, canvas.width, canvas.height)
            video.play()
          }, ms(60))

          this._removeCaptureKey = keyBinding(
            'keypress',
            ' ',
            this._postButton,
            this.startCapture
          )
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
    if (this._removeCaptureKey) this._removeCaptureKey()
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
    const isAltKey = e.altKey || e.ctrlKey || e.metaKey || e.shiftKey
    const isAltButton = e.button !== undefined && e.button !== 0
    const isKeyPress = e.type === 'keypress'

    if (isAltKey || isAltButton || (this._gif && this._gif.running)) {
      return
    }

    e.preventDefault()

    const { maxLength, gifFps, gifQuality } = this.props
    const { start } = this.state

    if (start) {
      // Stop hands-free capture mode
      if (isKeyPress) return this.stopCapture()
      // Dont start multiple recordings
      return
    }

    this._gif = gif({
      height: this._canvas.height,
      width: this._canvas.width,
      quality: gifQuality
    })

    this._gif.on('progress', (progress) => this.setState({ progress }))
    this._gif.on('finished', (image) => {
      // gif.js turns this on when rendering but not off when finished
      this._gif.running = false
      this.setImage({ image, now: 0 })
    })

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

    if (this._gif.running) return

    // Re-call stopCapture in the event of a quick tap after the minimum length
    // has passed
    if (current - start < minLength) {
      if (!this._minTimeout) {
        this._minTimeout = setTimeout(() => {
          this.stopCapture()
          this._minTimeout = null
        }, minLength - (current - start))
      }
      return
    }

    clearInterval(this._captureInterval)
    this._gif.render()
  }

  render(
    { image, maxLength, readonly },
    { error, stream, progress, start, current }
  ) {
    const hasProgress = typeof progress === 'number'

    return (
      <div class={styles.container}>
        {!stream && !error ? (
          <div class={styles.initial}>Granting camera access</div>
        ) : error ? (
          <div class={styles.error}>Error: {error}</div>
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
                <BlobImage
                  class={styles.image}
                  alt="Your mug!"
                  style={{ height: this._videoHeight }}
                  src={image}
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
                  ref={(c) => (this._postButton = c)}
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
                disabled={readonly}
                class={styles.btnCapture}
                onClick={
                  readonly ? noop : () => this.setImage({ image: null, now: 0 })
                }
              >
                {readonly ? 'Looking good' : 'Reset gif'}
              </button>
            )}
          </div>
        )}
      </div>
    )
  }
}
