import { h, Component } from 'preact'
import { authUrl } from '../lib/auth'
import Splash from '../components/splash'
import App from 'async!../components/app'
import styles from './home.css'

export default class Home extends Component {
  render(props) {
    const { supported, team } = props
    return (
      <div>
        {!supported ? (
          <Splash>
            <p>
              Facecamp uses technologies that are not supported by this browser.
              Try using <a href="https://chrome.com">Chrome</a> or{' '}
              <a href="http://www.mozilla.org/en-US/firefox/new/">Firefox</a>.
            </p>
          </Splash>
        ) : !team ? (
          <Splash>
            <div>
              <p>Sign in with:</p>
              <p>
                <a class={styles.btnSlackAuth} href={authUrl}>
                  Login with Slack
                </a>
              </p>
            </div>
          </Splash>
        ) : (
          <App {...props} />
        )}
      </div>
    )
  }
}
