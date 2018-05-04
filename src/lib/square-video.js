import { h, Component } from 'preact'
import throttle from '../lib/throttle-event'

export default class SquareVideo extends Component {
  state = {
    ratio: 1
  }

  componentDidMount() {
    this._removeResize = throttle('resize', this.setDimensions)
  }

  componentWillUnmount() {
    if (this._removeResize) this._removeResize()
  }

  setDimensions = () => {
    const { videoHeight, videoWidth } = this._video || {}

    // Exit early if the video isnt loaded yet
    if (!videoHeight || !videoWidth) return

    this.setState({ ratio: videoWidth / videoHeight })
  }

  getVideo = () => this._video

  render(props, { ratio }) {
    return (
      <video
        {...props}
        ref={(c) => (this._video = c)}
        style={{
          ...props.style,
          [ratio > 1 ? 'height' : 'width']: '100%',
          [ratio > 1 ? 'width' : 'height']: 'auto',
          left: '50%',
          position: 'absolute',
          top: '50%',
          transform: 'translate(-50%, -50%) rotateY(180deg)'
        }}
        onloadedmetadata={this.setDimensions}
      />
    )
  }
}
