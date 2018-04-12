import { h, Component } from 'preact'
import Capture from '../components/capture'
import Channels from '../components/channels'
import Message from '../components/message'
import styles from './app.css'

export default class App extends Component {
  state = {
    image: null,
    channel: null,
    message: ''
  }

  handlePost = () => {
    const { access_token: token } = this.props
    const { image, channel, message = "It's my mug on Facecamp!" } = this.state

    return console.log('this doesnt work yet', this.state)

    fetch('https://slack.com/api/chat.postMessage', {
      data: JSON.stringify({
        as_user: true,
        channel: channel.id,
        text: message
      }),
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    })
  }

  render(
    { access_token: token, team_name: team, logout },
    { image, channel, message }
  ) {
    return (
      <div>
        <button class={styles.btnLogout} onClick={logout}>logout</button>
        <p>Posting to {team}</p>
        <Channels
          onChange={(channel) => this.setState({ channel })}
          token={token}
        />
        <Capture onChange={(image) => this.setState({ image })} />
        <Message onChange={(message) => this.setState({ message })} />
        {image && channel && <button onClick={this.handlePost}>Post</button>}
      </div>
    )
  }
}
