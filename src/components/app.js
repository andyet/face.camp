import { h, Component } from 'preact'
import Capture from '../components/capture'
import Channels from '../components/channels'
import Message from '../components/message'
import fetchForm from '../lib/fetch-formdata'
import auth from '../lib/auth'
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
    defaultMessage: 'It’s my mug on facecamp'
  }

  handlePost = (e) => {
    e.preventDefault()

    const { access_token: token, defaultMessage } = this.props
    const { image, channel, message, uploading } = this.state

    if (!image || !channel || uploading) return

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

  reset = (e) => {
    e.preventDefault()
    this.setState({
      image: null,
      success: null,
      error: null,
      uploading: false,
      message: ''
    })
  }

  render(
    { access_token: token, team_name: team, logout, defaultMessage },
    { image, channel, uploading, success, error, message }
  ) {
    return (
      <div>
        <button class={styles.btnLogout} onClick={logout}>
          logout
        </button>
        <p>Posting to {team}</p>
        <Channels
          onError={(error) => this.setState({ error })}
          onChange={(channel) => this.setState({ channel })}
          token={token}
        />
        <Capture
          image={image}
          onChange={({ image }) => this.setState({ image })}
        />
        <form onSubmit={success ? this.reset : this.handlePost}>
          <Message
            message={message}
            onChange={(message) => this.setState({ message })}
            placeholder={defaultMessage}
          />
          {error && (
            <div class={styles.error}>
              Error: {error}. Try{' '}
              <a onClick={auth.delete} href={auth.url}>
                logging in
              </a>{' '}
              again.
            </div>
          )}
          <button
            class={styles.btnPost}
            type="submit"
            disabled={!image || !channel || uploading}
          >
            {uploading ? 'Uploading...' : success ? 'Post another' : 'Post'}
          </button>
        </form>
      </div>
    )
  }
}
