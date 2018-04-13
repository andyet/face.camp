import { h, Component } from 'preact'
import getUserMedia from 'getusermedia'

export default class GetUserMedia extends Component {
  state = {
    error: null,
    stream: null
  }

  static defaultProps = {
    maxLength: 3000,
    minLength: 500,
    width: 640,
    height: 480,
    canvasFps: 60,
    gifQuality: 10, // lower is better
    gifFps: 10,
    onChange: () => {}
  }

  componentDidMount() {
    getUserMedia({ video: true, audio: false }, (err, stream) =>
      this.setState({ error, stream })
    )
  }

  render({}, { stream, error, children }) {
    return <div>{children({ stream, error })}</div>
  }
}
