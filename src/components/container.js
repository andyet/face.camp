import { h, Component } from 'preact'
import { Router } from 'preact-router'
import {
  readTeams,
  deleteTeam,
  updateTeam,
  selectTeam,
  authUrl
} from '../lib/auth'
import Home from '../routes/home'
import Privacy from '../routes/privacy'
import browserSupport from '../lib/browser-support'
import styles from './container.css'

const initialTeams = readTeams()
const initialIndex = initialTeams.findIndex(({ selected }) => selected)

export default class Container extends Component {
  state = {
    teams: initialTeams,
    selectedTeam: initialIndex === -1 ? 0 : initialIndex,
    supported: browserSupport()
  }

  deleteTeam = () => deleteTeam(this.state.teams[this.state.selectedTeam])

  logout = () => {
    this.setState({ teams: this.deleteTeam() })
  }

  reauth = () => {
    this.deleteTeam()
    window.location.href = authUrl
  }

  selectTeam = () => {
    const { teams, selectedTeam } = this.state
    const nextIndex = selectedTeam + 1 >= teams.length ? 0 : selectedTeam + 1
    this.setState({
      selectedTeam: nextIndex,
      teams: selectTeam(teams[nextIndex])
    })
  }

  selectChannel = (channel) => {
    const { teams, selectedTeam } = this.state
    this.setState({
      teams: updateTeam(teams[selectedTeam], { last_channel: channel.id })
    })
  }

  render(props, { teams, selectedTeam, supported }) {
    return (
      <div class={styles.container}>
        <div class={styles.inner}>
          <Router>
            <Home
              path="/"
              team={teams[selectedTeam]}
              teamCount={teams.length}
              supported={supported}
              selectTeam={this.selectTeam}
              selectChannel={this.selectChannel}
              logout={this.logout}
              reauth={this.reauth}
            />
            <Privacy path="/privacy" />
          </Router>
        </div>
      </div>
    )
  }
}
