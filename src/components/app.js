import { h, Component } from 'preact'
import cx from 'classnames'
import pb from 'pretty-bytes'
import Capture from '../components/capture'
import Channels from '../components/channels'
import Message from '../components/message'
import fetchForm from '../lib/fetch-formdata'
import { authUrl } from '../lib/auth'
import styles from './app.css'

export default class App extends Component {
  state = {
    image: null,
    channel: null,
    message: '',
    postError: null,
    channelsError: null,
    uploading: false,
    success: null
  }

  static defaultProps = {
    defaultMessage: 'It’s my mug on facecamp'
  }

  handlePost = (e) => {
    e.preventDefault()

    const { team, defaultMessage } = this.props
    const { image, channel, message, uploading } = this.state

    if (!image || !channel || uploading) return

    this.setState({ uploading: true, success: null, postError: null })

    fetchForm('https://slack.com/api/files.upload', {
      method: 'POST',
      data: {
        token: team.access_token,
        title: message || defaultMessage,
        channels: channel.id,
        filetype: 'gif',
        filename: 'facecamp.gif',
        file: image
      }
    })
      .then((success) => {
        this.setState({ uploading: false, success, postError: null })
      })
      .catch((error) =>
        this.setState({ uploading: false, success: null, postError: error })
      )
  }

  reset = (e) => {
    e.preventDefault()
    this.setState({
      image: null,
      success: null,
      postError: null,
      uploading: false,
      message: ''
    })
  }

  render(
    { teams, team, selectTeam, logout, defaultMessage },
    { image, channel, uploading, success, postError, channelsError, message }
  ) {
    const error = postError || channelsError
    return (
      <div>
        <button class={styles.btnLogout} onClick={logout}>
          logout
        </button>
        <p>
          Posting to {team.team_name}
          {teams.length > 1 && (
            <span>
              {' '}
              <button
                onClick={selectTeam}
                class={cx(styles.btnLink, styles.btnNav)}
              >
                🔀
              </button>
            </span>
          )}{' '}
          <a href={authUrl} class={styles.btnNav}>
            ➕
          </a>
        </p>
        <Channels
          onError={(error) => this.setState({ channelsError: error })}
          onChange={(channel) => this.setState({ channel })}
          token={team.access_token}
        />
        <Capture
          image={image}
          allowReset={!uploading && !success && !error}
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
              <button
                class={styles.btnLink}
                onClick={() => {
                  logout()
                  window.location.href = authUrl
                }}
              >
                logging in
              </button>{' '}
              again.
            </div>
          )}
          <button
            class={styles.btnPost}
            type="submit"
            disabled={!image || !channel || uploading}
          >
            {uploading
              ? 'Uploading...'
              : success
                ? 'Post another'
                : `Post${image ? ` (${pb(image.size)})` : ''}`}
          </button>
        </form>
      </div>
    )
  }
}
