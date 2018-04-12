import { h, Component } from 'preact'
import Capture from '../components/capture'
import Channels from '../components/channels'
import Message from '../components/message'

export default class Home extends Component {
  state = {
    image: null,
    channel: null,
    message: ''
  }

  handlePost = () => {
    console.log(this.state)
  }

  render(
    { access_token: token, team_name: team },
    { image, channel, message }
  ) {
    return (
      <div>
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
