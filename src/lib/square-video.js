import { h, Component } from 'preact'
import cx from 'classnames'
import throttle from '../lib/throttle-event'

export default class SquareVideo extends Component {
  state = {
    width: 0,
    ratio: 0
  }

  componentDidMount() {
    this._removeResize = throttle('resize', this.setDimensions)
    this.setDimensions()
  }

  componentWillUnmount() {
    if (this._removeResize) this._removeResize()
  }

  setDimensions = () => {
    const { videoHeight, videoWidth } = this._video
    const dimensions = { width: this.props.maxWidth() }

    if (videoWidth && videoHeight) {
      dimensions.ratio = videoWidth / videoHeight
    }

    this.setState(dimensions)
  }

  getVideo = () => this._video
  getContainer = () => this._container

  render({ style: containerStyle, maxWidth: __, ...props }, { width, ratio }) {
    return (
      <div
        ref={(c) => (this._container = c)}
        style={{
          ...containerStyle,
          width,
          height: width,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <video
          {...props}
          ref={(c) => (this._video = c)}
          style={{
            [ratio > 1 ? 'height' : 'width']: '100%',
            left: '50%',
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%) rotateY(180deg)'
          }}
          onloadedmetadata={this.setDimensions}
        />
      </div>
    )
  }
}
