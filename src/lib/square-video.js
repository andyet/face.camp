import { h, Component } from 'preact'
import debounce from './debounce'

export default class SquareVideo extends Component {
  state = {
    videoHeight: 0,
    videoWidth: 0
  }

  // Public API for parent to consume video ref
  getVideo = () => this._video

  handleVideoLoaded = () => {
    // On iOS video dimensions need to wait for a bit to be correct
    this.debouncedDimensions = debounce(this.setDimensions, 100)
    window.addEventListener('orientationchange', this.debouncedDimensions)
    this.setDimensions()
  }

  componentWillUnmount = () => {
    if (this.debouncedDimensions) {
      window.removeEventListener('orientationchange', this.debouncedDimensions)
    }
  }

  setDimensions = () => {
    const { videoHeight, videoWidth } = this._video
    this.setState({ videoWidth, videoHeight })
  }

  render(props, { videoWidth, videoHeight }) {
    const ratio = videoWidth && videoHeight ? videoWidth / videoHeight : 0
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
        onloadedmetadata={this.handleVideoLoaded}
      />
    )
  }
}
