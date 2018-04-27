import { h, Component } from 'preact'
import cx from 'classnames'
import BlobImage from './blob-image'
import gif from '../lib/gif'
import keyBinding from '../lib/keyBindings'
import styles from './capture.css'

export default class Home extends Component {
  state = {
    error: null,
    stream: null,
    start: 0,
    current: 0,
    captureProgress: null,
    progress: null
  }

  static defaultProps = {
    readonly: false,
    image: null
  }

  componentDidMount() {
    navigator.mediaDevices
      .getUserMedia({ audio: false, video: { facingMode: 'user' } })
      .then((stream) => {
        this.setState({ stream })

        this._removeCaptureKey = keyBinding(
          'keypress',
          ' ',
          this._postButton,
          this.startCapture
        )
      })
      .catch((error) => {
        this.setState({ error: error.message })
      })
  }

  componentWillUnmount() {
    if (this._gif) this._gif.cleanUp()
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
    this.setState({
      start: now,
      current: now,
      captureProgress: null,
      progress: null
    })
  }

  startCapture = (e) => {
    const isAltKey = e.altKey || e.ctrlKey || e.metaKey || e.shiftKey
    const isAltButton = e.button !== undefined && e.button !== 0
    const isKeyPress = e.type === 'keypress'

    if (isAltKey || isAltButton || (this._gif && this._gif.running)) {
      return
    }

    e.preventDefault()

    const { start } = this.state

    if (start) {
      // Stop hands-free capture mode
      if (isKeyPress) return this.stopCapture()
      // Dont start multiple recordings
      return
    }

    this._gif = gif({
      video: this._video,
      onStart: (now) => this.setImage({ now }),
      onProgress: (progress) => this.setState({ progress }),
      onFinished: (image) => this.setImage({ image }),
      onFrame: ({ current, progress }) =>
        this.setState({ current, captureProgress: progress })
    })
  }

  stopCapture = () => {
    this._gif.render()
  }

  render(
    { image, readonly },
    { error, stream, progress, start, current, captureProgress }
  ) {
    const hasProgress = typeof progress === 'number'
    // Add two for some reason, sorry!
    // (It prevents elements being jumpy when transitioning from video -> progress -> image)
    const prevVideoHeight = this._videoHeight + 2
    return (
      <div class={styles.container}>
        {!stream && !error ? (
          <div class={styles.initial}>Granting camera access</div>
        ) : error ? (
          <div class={styles.error}>Error: {error}</div>
        ) : (
          <div>
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
                    style={{ height: prevVideoHeight }}
                  >
                    {(progress * 100).toFixed(0)}%
                  </div>
                )}
              {image && (
                <BlobImage
                  class={styles.image}
                  alt="Your mug!"
                  style={{ height: prevVideoHeight }}
                  src={image}
                />
              )}
              {!image &&
                !hasProgress && (
                  <div
                    class={styles.captureProgress}
                    style={{
                      width: `${100 * captureProgress}%`
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
                onClick={readonly ? () => {} : () => this.setImage()}
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
