import { h, Component } from 'preact'
import dateformat from 'dateformat'
import Capture from '../components/capture2'
import Channels from '../components/channels'
import Message from '../components/message'
import fetchForm from '../lib/fetch-formdata'
import styles from './app.css'

export default class App extends Component {
  state = {
    image: null,
    channel: null,
    message: '',
    error: null,
    uploading: false,
    success: null
  }

  static defaultProps = {
    message: 'Its my mug on facecamp'
  }

  handlePost = () => {
    const { access_token: token, message: defaultMessage } = this.props
    const { image, channel, message } = this.state

    this.setState({ uploading: true, success: null, error: null })

    fetchForm('https://slack.com/api/files.upload', {
      method: 'POST',
      data: {
        token,
        title: message || defaultMessage,
        channels: channel.id,
        filetype: 'gif',
        filename: 'facecamp.gif',
        file: image
      }
    })
      .then((success) => {
        this.setState({ uploading: false, success, error: null })
      })
      .catch((error) =>
        this.setState({ uploading: false, success: null, error })
      )
  }

  // TODO: reset message and image when posting another
  // TODO: reset button when erroring
  // TODO: responsive canvas and video
  render(
    { access_token: token, team_name: team, logout, message },
    { image, channel, uploading, success, error }
  ) {
    return (
      <div>
        <button class={styles.btnLogout} onClick={logout}>
          logout
        </button>
        <p>Posting to {team}</p>
        <Channels
          onChange={(channel) => this.setState({ channel })}
          token={token}
        />
        <Capture image={image} onChange={(image) => this.setState({ image })} />
        <Message
          onChange={(message) => this.setState({ message })}
          placeholder={message}
        />
        {image &&
          channel &&
          !uploading &&
          !success && <button onClick={this.handlePost}>Post</button>}
        {uploading && <div>Uploading...</div>}
        {success && (
          <div>
            Success!{' '}
            <button onClick={() => this.setState({ success: null })}>
              Post another
            </button>
          </div>
        )}
        {error && <div>{error}</div>}
      </div>
    )
  }
}
