import { h, cloneElement, Component } from 'preact'
import cx from 'classnames'
import throttle from '../lib/throttle-event'
import styles from './square-video.css'

export default class SquareVideo extends Component {
  state = {
    width: 0,
    ratio: 0
  }

  componentDidMount() {
    this._removeResize = throttle('resize', this.setDimensions)
  }

  componentWillUnmount() {
    if (this._removeResize) this._removeResize()
  }

  setDimensions = () => {
    if (!this._video) return

    const { clientWidth } = this._container.parentElement
    const { videoHeight, videoWidth } = this._video

    this.setState({ width: clientWidth, ratio: videoWidth / videoHeight })
  }

  render(
    { video, class: containerClass, style: containerStyle, ...props },
    { width, ratio }
  ) {
    return (
      <div
        ref={(c) => (this._container = c)}
        class={cx(containerClass, styles.square)}
        style={{
          ...containerStyle,
          width,
          height: width
        }}
      >
        <video
          {...props}
          ref={(c) => (this._video = c)}
          class={styles.video}
          style={{ [ratio > 1 ? 'height' : 'width']: '100%' }}
          onloadedmetadata={this.setDimensions}
        />
      </div>
    )
  }
}
