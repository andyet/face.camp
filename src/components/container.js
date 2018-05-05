import { h, Component } from 'preact'
import { Router } from 'preact-router'
import * as auth from '../lib/auth'
import Home from '../routes/home'
import Privacy from '../routes/privacy'
import browserSupport from '../lib/browser-support'
import styles from './container.css'

export default class Container extends Component {
  state = {
    teams: auth.read(),
    supported: browserSupport()
  }

  getSelectedTeam = () => {
    const { teams } = this.state
    return teams.find((t) => !!t.selected) || teams[0]
  }

  deleteTeam = () => auth.delete(this.getSelectedTeam())

  logout = () => {
    this.setState({ teams: this.deleteTeam() })
  }

  reauth = () => {
    this.deleteTeam()
    window.location.href = auth.url
  }

  selectTeam = () => {
    const { teams } = this.state
    const index = teams.indexOf(this.getSelectedTeam())
    const nextIndex = index + 1 >= teams.length ? 0 : index + 1
    this.setState({ teams: auth.add(teams[nextIndex]) })
  }

  selectChannel = (e) => {
    this.setState({
      teams: auth.update(this.getSelectedTeam(), {
        last_channel: e.target.value
      })
    })
  }

  render(props, { teams, supported }) {
    return (
      <div class={styles.container}>
        <div class={styles.inner}>
          <Router>
            <Home
              path="/"
              team={this.getSelectedTeam()}
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
