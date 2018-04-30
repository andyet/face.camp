import { h, Component } from 'preact'
import cx from 'classnames'
import BlobImage from './blob-image'
import SquareVideo from './square-video'
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
    renderProgress: null,
    imageLoaded: false
  }

  static defaultProps = {
    readonly: false,
    image: null
  }

  componentDidMount() {
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          facingMode: 'user'
        }
      })
      .then((stream) => {
        this.setState({ stream })

        // Wait a tick until the doms refs have been instantiated
        setTimeout(() => {
          this._removeCaptureKey = keyBinding(
            'keypress',
            ' ',
            this._postButton,
            this.startCapture
          )

          this._gif = gif({
            video: this._video.getVideo(),
            onStart: ({ time }) => this.setImage({ now: time }),
            onProgress: ({ progress }) =>
              this.setState({ renderProgress: progress }),
            onFinished: ({ image }) => this.setImage({ image }),
            onFrame: ({ current, progress }) =>
              this.setState({ current, captureProgress: progress })
          })
        }, 0)
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
    const videoContainer = this._video && this._video.getContainer()

    if (!videoContainer) return

    if (videoContainer.clientHeight) {
      this._videoHeight = videoContainer.clientHeight
    }
  }

  setImage = ({ image = null, now = 0 } = {}) => {
    const { onChange } = this.props
    onChange({ image })
    this.setState({
      start: now,
      current: now,
      captureProgress: null,
      renderProgress: null
    })
  }

  startCapture = (e) => {
    const isAltKey = e.altKey || e.ctrlKey || e.metaKey || e.shiftKey
    const isAltButton = e.button !== undefined && e.button !== 0
    const isKeyPress = e.type === 'keypress'

    if (isAltKey || isAltButton || this._gif.isRunning()) {
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

    this._gif.start()
  }

  stopCapture = () => this._gif.stop()

  render(
    { image, readonly },
    {
      error,
      stream,
      renderProgress,
      start,
      current,
      captureProgress,
      imageLoaded
    }
  ) {
    const isRendering = typeof renderProgress === 'number'
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
              <SquareVideo
                class={styles.cropVideo}
                style={{ display: image || isRendering ? 'none' : 'block' }}
                ref={(c) => (this._video = c)}
                autoplay
                muted
                playsinline
                srcObject={stream}
              />
              {!image &&
                isRendering && (
                  <div
                    class={styles.renderProgress}
                    style={{ height: prevVideoHeight }}
                  >
                    {(renderProgress * 100).toFixed(0)}%
                  </div>
                )}
              {image && (
                <BlobImage
                  class={styles.image}
                  alt="Your mug!"
                  style={!imageLoaded && { height: prevVideoHeight }}
                  onload={() => this.setState({ imageLoaded: true })}
                  src={image}
                />
              )}
              {!image &&
                !isRendering && (
                  <div
                    class={styles.captureProgress}
                    style={{
                      width: `${100 * captureProgress}%`
                    }}
                  />
                )}
            </div>
            {!image &&
              !isRendering && (
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
              isRendering && (
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
