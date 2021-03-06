import { h, Component } from 'preact'
import cx from 'classnames'
import BlobImage from '../lib/blob-image'
import SquareVideo from '../lib/square-video'
import gif from '../lib/gif'
import keyBinding from '../lib/key-bindings'
import styles from './capture.css'

export default class Home extends Component {
  state = {
    streamError: null,
    stream: null,
    start: 0,
    current: 0,
    captureProgress: null,
    renderProgress: null,
    imageLoaded: false,
    canReset: false
  }

  static defaultProps = {
    readonly: false,
    image: null,
    error: null
  }

  async componentDidMount() {
    try {
      const stream = await window.navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'user'
        }
      })

      this.setState({ stream })
    } catch (error) {
      this.setState({ streamError: error.message })
    }
  }

  componentWillUnmount() {
    if (this._gif) this._gif.cleanUp()
    if (this._removeCaptureKey) this._removeCaptureKey()
  }

  componentDidUpdate(prevProps, prevState) {
    // If this component has just received a stream then set up handlers for
    // the space bar to start a capture and for the gif to be created
    if (!prevState.stream && this.state.stream) {
      this._removeCaptureKey = keyBinding(
        'keypress',
        ' ',
        this._postButton,
        this.startCapture
      )

      this._gif = gif({
        maxSize: this.props.maxSize,
        video: this._video.getVideo(),
        onStart: ({ time }) => this.setImage({ now: time }),
        onRender: ({ progress }) => this.setState({ renderProgress: progress }),
        onFinished: ({ image }) => this.setImage({ image }),
        onCapture: ({ current, progress }) =>
          this.setState({ current, captureProgress: progress })
      })
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

    const { start } = this.state
    const { image, error } = this.props

    // This comes first because we dont want to prevent default on any of these
    // events
    if (isAltKey || isAltButton || this._gif.isRunning()) {
      return
    }

    e.preventDefault()

    // Dont allow capturing if we're in error mode passed in from parent
    if (error) {
      return
    }

    // If there already is an image then starting (via spacebar) should reset
    // the image first instead of immediately starting a new capture
    if (image) {
      this.setImage()
      return
    }

    // If the capturing has already started
    if (start) {
      // Then stop hands-free capture mode if the event is the second press
      if (isKeyPress) this.stopCapture()
      // But dont start another capture
      return
    }

    this._gif.start()
  }

  stopCapture = () => this._gif.stop()

  render(
    { image, readonly, error },
    {
      streamError,
      stream,
      renderProgress,
      start,
      current,
      captureProgress,
      imageLoaded,
      canReset
    }
  ) {
    const isRendering = typeof renderProgress === 'number'
    return (
      <div>
        {!stream || streamError ? (
          <div>
            <div
              class={cx(styles.mediaContainer, {
                [styles.errorContainer]: !!streamError
              })}
            >
              <div class={cx(styles.mediaText)}>
                {streamError
                  ? `Error: ${streamError}`
                  : 'Granting camera access'}
              </div>
            </div>
            <button class={cx(styles.btnCapture)} disabled>
              Hold to record
            </button>
          </div>
        ) : (
          <div>
            <div
              class={cx(styles.mediaContainer, {
                [styles.errorContainer]: !!error
              })}
            >
              <SquareVideo
                style={{
                  display: image || isRendering || error ? 'none' : 'block'
                }}
                ref={(c) => (this._video = c)}
                autoplay
                muted
                playsinline
                srcObject={stream}
              />
              {error ? (
                <div class={cx(styles.mediaText)}>{error}</div>
              ) : image ? (
                <BlobImage class={styles.image} alt="Your mug!" src={image} />
              ) : isRendering ? (
                <div class={styles.mediaText}>
                  {(renderProgress * 100).toFixed(0)}%
                </div>
              ) : (
                <div
                  class={styles.captureProgress}
                  style={{
                    width: `${100 * captureProgress}%`
                  }}
                />
              )}
            </div>
            {error || readonly ? (
              <button disabled class={styles.btnCapture}>
                Hold to record
              </button>
            ) : !image && !isRendering ? (
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
            ) : !image && isRendering ? (
              <button class={styles.btnCapture} disabled>
                Rendering
              </button>
            ) : (
              <button
                class={styles.btnCapture}
                onMouseUp={() => {
                  if (canReset) {
                    this.setImage()
                    this.setState({ canReset: false })
                  }
                }}
                onMouseDown={() => this.setState({ canReset: true })}
              >
                Reset gif
              </button>
            )}
          </div>
        )}
      </div>
    )
  }
}
