import './index.css'

import { h, Component } from 'preact'

import { readTeams, deleteTeam, updateTeam } from './lib/auth'
import App from './components/app'
import Splash from './components/splash'

if (module.hot) {
  require('preact/debug')
}

const initialTeams = readTeams()
const getSelected = (teams) => (teams && teams.length ? teams[0] : null)

export default class Index extends Component {
  state = {
    teams: initialTeams,
    selectedTeam: getSelected(initialTeams)
  }

  logout = () => {
    const { selectedTeam } = this.state
    const remainingTeams = deleteTeam(selectedTeam)
    this.setState({
      teams: remainingTeams,
      selectedTeam: getSelected(remainingTeams)
    })
  }

  selectTeam = () => {
    const { teams, selectedTeam } = this.state
    const index = teams.indexOf(selectedTeam)
    const nextIndex = index + 1 >= teams.length ? 0 : index + 1
    const nextTeam = teams[nextIndex]

    const nextTeams = updateTeam(nextTeam, { last_used: Date.now() })

    this.setState({ teams: nextTeams, selectedTeam: nextTeam })
  }

  render(props, { teams, selectedTeam }) {
    return (
      <div id="app">
        {selectedTeam ? (
          <App
            teams={teams}
            team={selectedTeam}
            selectTeam={this.selectTeam}
            logout={this.logout}
          />
        ) : (
          <Splash />
        )}
      </div>
    )
  }
}
