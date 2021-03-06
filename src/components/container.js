import { h, Component } from 'preact'
import { Router, route } from 'preact-router'
import * as auth from '../lib/auth'
import Home from '../routes/home'
import Privacy from '../routes/privacy'
import FourOhFour from '../routes/404'
import browserSupport from '../lib/browser-support'
import styles from './container.css'

export default class Container extends Component {
  state = {
    teams: auth.read(),
    supported: browserSupport()
  }

  componentDidMount() {
    // This makes it work in Android PWAs
    window.addEventListener('hashchange', this.setTeamsFromAuth)
    // This is so the app will respond to localStorage changes from the dev console
    window.addEventListener('storage', this.setTeamsFromAuth)
  }

  componentWillUnmount() {
    window.removeEventListener('hashchange', this.setTeamsFromAuth)
    window.removeEventListener('storage', this.setTeamsFromAuth)
  }

  setTeamsFromAuth = () => {
    this.setState({ teams: auth.read() })
  }

  getSelectedTeam = () => {
    const { teams } = this.state
    return teams.find((t) => !!t.selected) || teams[0]
  }

  logout = () => {
    const team = this.getSelectedTeam()
    const remaining = auth.delete(team)
    this.setState({ teams: remaining })
    return auth.revoke(team).catch(
      // Just log this error since there isnt much to do about it and we still
      // removed the token from local storage and state
      // eslint-disable-next-line no-console
      (err) => console.error(err)
    )
  }

  reauth = () => {
    // Only difference between reauth and logout is that it first routes to the
    // auth page to force the user to login again for that team
    route('/auth')
    return this.logout()
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
            <FourOhFour default />
          </Router>
        </div>
      </div>
    )
  }
}
