import { h, Component } from 'preact'
import cx from 'classnames'
import pb from 'pretty-bytes'
import BodyClass from '../lib/body-class'
import Capture from './capture'
import Conversations from './conversations'
import Message from './message'
import postImage from '../lib/post-image'
import fetchConversations from '../lib/fetch-conversations'
import styles from './app.css'

export default class App extends Component {
  state = {
    image: null,
    message: '',
    // Posting
    postError: null,
    postUploading: false,
    postSuccess: null,
    // Conversations
    conversationsError: null,
    conversationsFetching: false,
    conversations: null
  }

  static defaultProps = {
    defaultMessage: 'It’s my mug on Facecamp',
    maxSize: 2e6
  }

  componentDidMount() {
    this.fetchConversations()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.team.access_token !== this.props.team.access_token) {
      this.cancelConversations()
      this.fetchConversations()
    }

    // Since conversations are loaded initially, if there is a token_revoked
    // error then we can immediately revoke the token and route to the auth page
    const { conversationsError } = this.state
    if (
      conversationsError &&
      conversationsError !== prevState.conversationsError &&
      conversationsError.reauthError
    ) {
      this.props.reauth()
    }
  }

  componentWillUnmount() {
    this.cancelConversations()
    this.cancelPost()
  }

  cancelConversations = () => {
    if (this.state.conversationsFetching && this.conversationsController) {
      this.conversationsController.abort()
    }
  }

  fetchConversations = async () => {
    this.setState({
      conversationsFetching: true,
      conversations: null,
      conversationsError: null
    })

    this.conversationsController = new AbortController()

    try {
      const conversations = await fetchConversations(this.props.team, {
        signal: this.conversationsController.signal
      })

      this.setState({
        conversations,
        conversationsError: null,
        conversationsFetching: false
      })
    } catch (conversationsError) {
      if (conversationsError.name === 'AbortError') {
        return
      }

      this.setState({
        conversations: null,
        conversationsError,
        conversationsFetching: false
      })
    }
  }

  getConversation = () => {
    const { team } = this.props
    const {
      conversations,
      conversationsFetching,
      conversationsError
    } = this.state

    if (conversationsFetching || conversationsError || !conversations)
      return null

    // Dont use the last selected conversation unless it is part of the group of
    // conversations that is currently fetched in case permissions have changed
    const selected =
      team.last_conversation &&
      conversations.all.find((c) => c.id === team.last_conversation)

    return (selected || conversations.all[0] || {}).id
  }

  canPost = () => {
    const conversation = this.getConversation()
    const { image, postUploading, postError } = this.state
    return !!(image && conversation && !postUploading && !postError)
  }

  imageTooBig = () => {
    const { image } = this.state
    const { maxSize } = this.props
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

  cancelPost = () => {
    if (this.state.postUploading && this.postController) {
      this.postController.abort()
    }
  }

  handlePost = async (e) => {
    e.preventDefault()

    const { team, defaultMessage } = this.props
    const { image, message } = this.state
    const conversation = this.getConversation()

    if (!this.canPost()) return
    if (this.imageTooBig()) return

    this.setState({ postUploading: true, postSuccess: null, postError: null })

    this.postController = new AbortController()

    try {
      const postSuccess = await postImage(
        {
          title: message || defaultMessage,
          channel: conversation,
          access_token: team.access_token,
          image
        },
        { signal: this.postController.signal }
      )

      this.setState({ postUploading: false, postSuccess, postError: null })
    } catch (postError) {
      if (postError.name === 'AbortError') {
        return
      }

      this.setState({
        postUploading: false,
        postSuccess: null,
        postError
      })
    }
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
      selectConversation,
      logout,
      reauth,
      defaultMessage,
      maxSize
    },
    {
      image,
      conversation,
      postUploading,
      postSuccess,
      postError,
      conversationsError,
      conversationsFetching,
      conversations,
      message
    }
  ) {
    const error = postError || conversationsError
    return (
      <div>
        <BodyClass class={styles.isMinHeight}>
          <div class={styles.minHeight}>
            <h1>Increase your browser height, please.</h1>
            <p>Facecamp needs a wee bit more room.</p>
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
          <a href="/auth" class={cx(styles.btnNav, styles.btnAdd)}>
            Add Team
          </a>
        </div>
        <Conversations
          selected={this.getConversation()}
          error={conversationsError}
          fetching={conversationsFetching}
          conversations={conversations}
          onChange={(id) => {
            this.setState({ postError: null })
            selectConversation(id)
          }}
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
                {error.authError && (
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
            onInput={(e) =>
              this.setState({ message: e.target.value, postError: null })
            }
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
