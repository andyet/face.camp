import { h, Component } from 'preact'
import cx from 'classnames'
import pb from 'pretty-bytes'
import Capture from '../components/capture'
import Channels from '../components/channels'
import Message from '../components/message'
import slackFetch from '../lib/slack-fetch'
import { authUrl } from '../lib/auth'
import slug from '../lib/slug'
import ts from '../lib/timestamp'
import styles from './app.css'

export default class App extends Component {
  state = {
    image: null,
    message: '',
    postError: null,
    channelsError: null,
    uploading: false,
    success: null
  }

  static defaultProps = {
    defaultMessage: 'It’s my mug on Facecamp',
    confirmSize: 1500000
  }

  canPost = () => {
    const { image, channel, uploading, postError, channelsError } = this.state
    return !!(image && channel && !uploading && !postError && !channelsError)
  }

  handlePost = (e) => {
    e.preventDefault()

    const { team, defaultMessage, confirmSize } = this.props
    const { image, channel, message } = this.state

    if (!this.canPost()) return

    if (
      image.size > confirmSize &&
      !confirm(
        `Images over ${pb(
          confirmSize
        )} won't show inline previews on mobile Slack clients. Would you like to continue?`
      )
    ) {
      return
    }

    this.setState({ uploading: true, success: null, postError: null })

    const title = message || defaultMessage

    slackFetch('https://slack.com/api/files.upload', {
      method: 'POST',
      body: {
        token: team.access_token,
        title,
        channels: channel.id,
        filetype: 'gif',
        filename: `${ts()} ${slug(title).substring(0, 240)}.gif`,
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

  selectChannel = (channel, { userSelected } = {}) => {
    this.setState({ channel })
    if (userSelected) {
      this.props.selectChannel(channel)
    }
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
          Post to {team.team_name}
          {teams.length > 1 && (
            <span>
              {' '}
              <button
                onClick={selectTeam}
                class={cx(styles.btnLink, styles.btnNav, styles.btnSwap)}
              >
                Swap Team
              </button>
            </span>
          )}{' '}
          <a href={authUrl} class={cx(styles.btnNav, styles.btnAdd)}>
            Add Team
          </a>
        </p>
        <Channels
          selected={team.last_channel || null}
          onError={(error) => this.setState({ channelsError: error })}
          onChange={this.selectChannel}
          token={team.access_token}
        />
        <Capture
          image={image}
          readonly={uploading || success}
          onChange={({ image }) => this.setState({ image, postError: null })}
        />
        <form onSubmit={success ? this.reset : this.handlePost}>
          <Message
            readonly={uploading || success}
            message={message}
            onChange={(message) => this.setState({ message })}
            placeholder={defaultMessage}
          />
          {error && (
            <div class={styles.error}>
              Error: {error.message}.
              {error.slackAuth && (
                <span>
                  {' '}
                  Try{' '}
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
                </span>
              )}
            </div>
          )}
          <button
            class={styles.btnPost}
            type="submit"
            disabled={!this.canPost()}
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
