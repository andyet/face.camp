import { h, Component } from 'preact'
import cx from 'classnames'
import pb from 'pretty-bytes'
import BodyClass from '../lib/body-class'
import Capture from './capture'
import Channels from './channels'
import Message from './message'
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
    maxSize: 2e6
  }

  canPost = () => {
    const { image, channel, uploading, postError, channelsError } = this.state
    return !!(image && channel && !uploading && !postError && !channelsError)
  }

  handlePost = (e) => {
    e.preventDefault()

    const { team, defaultMessage, maxSize } = this.props
    const { image, channel, message } = this.state

    if (!this.canPost()) return

    if (
      image.size > maxSize &&
      // eslint-disable-next-line no-restricted-globals
      !confirm(
        `Images over ${pb(
          maxSize
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
    { teams, team, selectTeam, logout, reauth, defaultMessage, maxSize },
    { image, channel, uploading, success, postError, channelsError, message }
  ) {
    const error = postError || channelsError
    return (
      <div>
        <BodyClass class={styles.isMinHeight}>
          <div class={styles.minHeight}>
            <h1>Increase your browser height</h1>
          </div>
        </BodyClass>
        <button class={styles.btnLogout} onClick={reauth}>
          logout
        </button>
        <div class={styles.team}>
          <div class={styles.teamName}>{team.team_name}</div>
          {teams.length > 1 && (
            <button
              onClick={selectTeam}
              class={cx(styles.btnNav, styles.btnSwap)}
            >
              Swap Team
            </button>
          )}
          <a href={authUrl} class={cx(styles.btnNav, styles.btnAdd)}>
            Add Team
          </a>
        </div>
        <Channels
          selected={team.last_channel || null}
          onError={(error) => this.setState({ channelsError: error })}
          onChange={this.selectChannel}
          token={team.access_token}
        />
        <Capture
          maxSize={maxSize}
          image={image}
          readonly={uploading || success}
          onChange={({ image }) => this.setState({ image, postError: null })}
          error={
            error && (
              <span>
                Error: {error.message}.
                {error.slackAuth && (
                  <span>
                    {' '}
                    Try{' '}
                    <button class={styles.btnLink} onClick={reauth}>
                      logging in
                    </button>{' '}
                    again.
                  </span>
                )}
              </span>
            )
          }
        />
        <form onSubmit={success ? this.reset : this.handlePost}>
          <Message
            readonly={uploading || success}
            value={message}
            onInput={(e) => this.setState({ message: e.target.value })}
            placeholder={defaultMessage}
          />
          <button
            class={styles.btnPost}
            type="submit"
            disabled={!this.canPost()}
          >
            {uploading
              ? 'Uploading...'
              : success
                ? 'Success! Post another?'
                : `Post${image ? ` (${pb(image.size)})` : ''}`}
          </button>
        </form>
      </div>
    )
  }
}
