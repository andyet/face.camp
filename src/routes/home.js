import { h, Component } from 'preact'
import { authUrl } from '../lib/auth'
import Splash from '../components/splash'
// eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
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
              Facecamp uses technologies that are not supported by this browser.{' '}
              {window.navigator.standalone ? (
                <span>
                  {/* Hack to open outside the webapp since the url is a different domain
                  but this path at the auth server will redirect back to the app */}
                  Try opening it in <a href={`${authUrl}/app`}>Safari</a>.
                </span>
              ) : (
                <span>
                  Try using <a href="https://chrome.com">Chrome</a> or{' '}
                  <a href="https://firefox.com">Firefox</a>.
                </span>
              )}
            </p>
          </Splash>
        ) : !team ? (
          <Splash>
            <div>
              <p>
                Facecamp connects to Slack to let you take animated gifs and
                post them in any channel for your teamies to see.
              </p>
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
