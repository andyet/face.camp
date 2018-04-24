import { h, Component } from 'preact'
import { Router } from 'preact-router'
import { readTeams, deleteTeam, updateTeam } from '../lib/auth'
import Home from '../routes/home'
import Privacy from '../routes/privacy'
import browserSupport from '../lib/browser-support'

const initialTeams = readTeams()
const getSelected = (teams) => (teams && teams.length ? teams[0] : null)

export default class Container extends Component {
  state = {
    teams: initialTeams,
    team: getSelected(initialTeams),
    supported: browserSupport()
  }

  logout = () => {
    const { team } = this.state
    const remainingTeams = deleteTeam(team)
    this.setState({
      teams: remainingTeams,
      team: getSelected(remainingTeams)
    })
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
      <div>
        <Router>
          <Home
            path="/"
            {...state}
            selectTeam={this.selectTeam}
            selectChannel={this.selectChannel}
            logout={this.logout}
          />
          <Privacy path="/privacy" />
        </Router>
      </div>
    )
  }
}
