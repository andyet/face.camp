import { h, Component } from 'preact'
import { Router } from 'preact-router'
import { readTeams, deleteTeam, updateTeam, authUrl } from '../lib/auth'
import Home from '../routes/home'
import Privacy from '../routes/privacy'
import browserSupport from '../lib/browser-support'
import styles from './container.css'

const initialTeams = readTeams()
const getSelected = (teams) => (teams && teams.length ? teams[0] : null)

export default class Container extends Component {
  state = {
    teams: initialTeams,
    team: getSelected(initialTeams),
    supported: browserSupport()
  }

  deleteTeam = () => deleteTeam(this.state.team)

  logout = () => {
    const remainingTeams = this.deleteTeam()
    this.setState({
      teams: remainingTeams,
      team: getSelected(remainingTeams)
    })
  }

  reauth = () => {
    this.deleteTeam()
    window.location.href = authUrl
  }

  selectTeam = () => {
    const { teams, team } = this.state
    const index = teams.indexOf(team)
    const nextIndex = index + 1 >= teams.length ? 0 : index + 1
    const nextTeam = teams[nextIndex]

    const nextTeams = updateTeam(nextTeam, { last_used: Date.now() })

    this.setState({ teams: nextTeams, team: nextTeam })
  }

  selectChannel = (channel) => {
    if (channel) {
      const { team } = this.state
      const teams = updateTeam(team, { last_channel: channel.id })
      this.setState({ teams, team })
    }
  }

  render(props, state) {
    return (
      <div class={styles.container}>
        <div class={styles.inner}>
          <Router>
            <Home
              path="/"
              {...state}
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
