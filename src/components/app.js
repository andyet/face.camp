import { h, Component } from 'preact'
import cx from 'classnames'
import pb from 'pretty-bytes'
import BodyClass from '../lib/body-class'
import Capture from './capture'
import Channels from './channels'
import Message from './message'
import postImage from '../lib/post-image'
import fetchChannels, { AbortChannelsError } from '../lib/fetch-channels'
import { url as authUrl } from '../lib/auth'
import styles from './app.css'

export default class App extends Component {
  state = {
    image: null,
    message: '',
    // Posting
    postError: null,
    postUploading: false,
    postSuccess: null,
    // Channels
    channelsError: null,
    channelsFetching: false,
    channels: []
  }

  static defaultProps = {
    defaultMessage: 'It’s my mug on Facecamp',
    maxSize: 2e6
  }

  componentDidMount() {
    this.fetchChannels()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.team.access_token !== this.props.team.access_token) {
      this.fetchChannels()
    }
  }

  fetchChannels = () => {
    this.setState({
      channelsFetching: true,
      channels: [],
      channelsError: null
    })

    const currentTeam = () => this.props.team

    fetchChannels(currentTeam(), currentTeam)
      .then((channels) => {
        this.setState({
          channels,
          channelsError: null,
          channelsFetching: false
        })
      })
      .catch((channelsError) => {
        if (channelsError instanceof AbortChannelsError) return
        this.setState({
          channels: [],
          channelsError,
          channelsFetching: false
        })
      })
  }

  getChannel = () => {
    const { team } = this.props
    const { channels, channelsFetching, channelsError } = this.state

    if (channelsFetching || channelsError || !channels.length) return null

    return team.last_channel || channels[0].id
  }

  canPost = () => {
    const channel = this.getChannel()
    const { image, postUploading, postError } = this.state
    return !!(image && channel && !postUploading && !postError)
  }

  imageTooBig = () => {
    const { image, maxSize } = this.props
    if (
      image.size > maxSize &&
      // eslint-disable-next-line no-restricted-globals
      !confirm(
        `Images over ${pb(
          maxSize
        )} won't show inline previews on mobile Slack clients. Would you like to continue?`
      )
    ) {
      return true
    }
  }

  handlePost = (e) => {
    e.preventDefault()

    const { team, defaultMessage } = this.props
    const { image, message } = this.state
    const channel = this.getChannel()

    if (!this.canPost()) return
    if (this.imageTooBig()) return

    this.setState({ postUploading: true, postSuccess: null, postError: null })

    postImage({
      title: message || defaultMessage,
      channel,
      access_token: team.access_token,
      image
    })
      .then((postSuccess) => {
        this.setState({ postUploading: false, postSuccess, postError: null })
      })
      .catch((error) =>
        this.setState({
          postUploading: false,
          postSuccess: null,
          postError: error
        })
      )
  }

  resetPost = (e) => {
    e.preventDefault()
    this.setState({
      image: null,
      postSuccess: null,
      postError: null,
      postUploading: false,
      message: ''
    })
  }

  render(
    {
      teamCount,
      team,
      selectTeam,
      selectChannel,
      logout,
      reauth,
      defaultMessage,
      maxSize
    },
    {
      image,
      channel,
      postUploading,
      postSuccess,
      postError,
      channelsError,
      channelsFetching,
      channels,
      message
    }
  ) {
    const error = postError || channelsError
    return (
      <div>
        <BodyClass class={styles.isMinHeight}>
          <div class={styles.minHeight}>
            <h1>Increase your browser height</h1>
          </div>
        </BodyClass>
        <button class={styles.btnLogout} onClick={logout}>
          logout
        </button>
        <div class={styles.team}>
          <div class={styles.teamName}>{team.team_name}</div>
          {teamCount > 1 && (
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
          selected={this.getChannel()}
          error={channelsError}
          fetching={channelsFetching}
          channels={channels}
          onChange={selectChannel}
        />
        <Capture
          maxSize={maxSize}
          image={image}
          readonly={postUploading || postSuccess}
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
        <form onSubmit={postSuccess ? this.resetPost : this.handlePost}>
          <Message
            readonly={postUploading || postSuccess}
            value={message}
            onInput={(e) => this.setState({ message: e.target.value })}
            placeholder={defaultMessage}
          />
          <button
            class={styles.btnPost}
            type="submit"
            disabled={!this.canPost()}
          >
            {postUploading
              ? 'Uploading...'
              : postSuccess
                ? 'Success! Post another?'
                : `Post${image ? ` (${pb(image.size)})` : ''}`}
          </button>
        </form>
      </div>
    )
  }
}
