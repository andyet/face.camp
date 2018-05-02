import { h, Component } from 'preact'

export default class SquareVideo extends Component {
  state = {
    ratio: 1
  }

  setDimensions = () => {
    const { videoHeight, videoWidth } = this._video

    this.setState({
      ratio: videoWidth / videoHeight
    })
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
