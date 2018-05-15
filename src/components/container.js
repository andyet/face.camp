import { h, Component } from 'preact'
import { Router, route } from 'preact-router'
import * as auth from '../lib/auth'
import slackFetch from '../lib/slack-fetch'
import Home from '../routes/home'
import Privacy from '../routes/privacy'
import browserSupport from '../lib/browser-support'
import styles from './container.css'

export default class Container extends Component {
  state = {
    teams: auth.read(),
    supported: browserSupport()
  }

  componentDidMount() {
    window.addEventListener('hashchange', () => {
      this.setState({ teams: auth.read() })
    })
  }

  getSelectedTeam = () => {
    const { teams } = this.state
    return teams.find((t) => !!t.selected) || teams[0]
  }

  deleteTeam = async () => {
    const team = this.getSelectedTeam()
    try {
      await slackFetch(
        `https://slack.com/api/auth.revoke?token=${team.access_token}`
      )
    } catch (error) {
      // Ignore token revocation errors since it gets deleted from localstorage
    }
    return auth.delete(team)
  }

  logout = async () => {
    this.setState({ teams: await this.deleteTeam() })
  }

  reauth = async () => {
    await this.deleteTeam()
    route('/auth')
  }

  selectTeam = () => {
    const { teams } = this.state
    const index = teams.indexOf(this.getSelectedTeam())
    const nextIndex = index + 1 >= teams.length ? 0 : index + 1
    this.setState({ teams: auth.add(teams[nextIndex]) })
  }

  selectConversation = (id) => {
    this.setState({
      teams: auth.update(this.getSelectedTeam(), {
        last_conversation: id
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
              selectConversation={this.selectConversation}
              logout={this.logout}
              reauth={this.reauth}
            />
            <Home path="/auth" team={null} supported={supported} />
            <Privacy path="/privacy" />
          </Router>
        </div>
      </div>
    )
  }
}
