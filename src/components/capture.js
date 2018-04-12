/* eslint-disable jsx-a11y/media-has-caption */

import { h, Component } from 'preact'
import getUserMedia from 'getusermedia'
import gif from '../lib/gif'

const STATES = {
  PREVIEW: 'preview',
  CAPTURING: 'capturing',
  RENDERING: 'rendering',
  RENDERED: 'rendered'
}

const ms = (fps) => 1000 / fps

export default class Home extends Component {
  state = {
    error: null,
    currentState: STATES.PREVIEW,
    captureStart: 0,
    captureCurrent: 0,
    progress: 0
  }

  static defaultProps = {
    maxLength: 5000,
    minLength: 500,
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

        this.resetGif()

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

  resetGif = () => {
    const { height, width, gifQuality, onChange } = this.props

    this.setState({ currentState: STATES.PREVIEW })

    this._gif = gif({ height, width, quality: gifQuality })
    onChange(null)

    this._gif.on('progress', (progress) => this.setState({ progress }))
    this._gif.on('finished', (imageBlob) => {
      this.setState({ currentState: STATES.RENDERED, imageBlob })
      onChange(imageBlob)
    })
  }

  startCapture = (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) {
      return
    }

    const { maxLength, gifFps } = this.props

    this.setState({ currentState: STATES.CAPTURING, captureStart: Date.now() })

    this._captureInterval = setInterval(() => {
      const current = Date.now()
      const { captureStart: start } = this.state

      if (start && current - start > maxLength) return this.stopCapture()

      this.setState({ captureCurrent: current })
      this._gif.addFrame(this._canvas, { copy: true, delay: ms(gifFps) })
    }, ms(gifFps))
  }

  stopCapture = () => {
    const { minLength } = this.props
    const {
      currentState,
      captureStart: start,
      captureCurrent: current
    } = this.state

    if (currentState !== STATES.CAPTURING) {
      return
    }

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

    this.setState({ currentState: STATES.RENDERING })

    this._gif.running = false
    this._gif.render()
  }

  componentWillUnmount() {
    clearInterval(this._canvasInterval)
    clearInterval(this._captureInterval)
    clearTimeout(this._minTimeout)
  }

  render(
    { height, width },
    { error, currentState, progress, captureStart, imageBlob }
  ) {
    if (error) {
      return <div>{error.message}</div>
    }
    return (
      <div>
        <video
          height={height}
          width={width}
          ref={(c) => (this._video = c)}
          style={{ display: 'none' }}
        />
        <canvas
          width={width}
          height={height}
          style={{
            display:
              currentState === STATES.PREVIEW ||
              currentState === STATES.CAPTURING
                ? 'block'
                : 'none'
          }}
          ref={(c) => (this._canvas = c)}
          onMouseDown={this.startCapture}
          onMouseUp={this.stopCapture}
        />
        <img
          style={{
            display: currentState === STATES.RENDERED ? 'block' : 'none'
          }}
          alt={imageBlob ? 'Your mug!' : ''}
          src={imageBlob ? URL.createObjectURL(imageBlob) : ''}
        />
        <div
          style={{
            display: currentState === STATES.CAPTURING ? 'block' : 'none',
            height: 20,
            background: 'blue',
            width: width * ((Date.now() - captureStart) / this.props.maxLength)
          }}
        />
        <div
          style={{
            width,
            height,
            background: '#ccc',
            display: currentState === STATES.RENDERING ? 'block' : 'none'
          }}
        >
          {(progress * 100).toFixed(0)}%
        </div>
        {currentState === STATES.RENDERED && (
          <button onClick={this.resetGif}>Reset</button>
        )}
      </div>
    )
  }
}
