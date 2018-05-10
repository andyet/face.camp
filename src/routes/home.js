import { h } from 'preact'
import { url as authUrl } from '../lib/auth'
import Splash from '../components/splash'
// eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
import App from 'async!../components/app'
import AuthButton from '../components/auth-button'
import styles from './home.css'

export default ({ supported, team, ...props }) => (
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
          <p class={styles.paragraph}>
            Facecamp connects to Slack to let you take animated gifs and post
            them in any channel for your teamies to see.
          </p>
          <p class={styles.paragraph}>Sign in with:</p>
          <p>
            <AuthButton url={authUrl} />
          </p>
        </div>
      </Splash>
    ) : (
      <App team={team} {...props} />
    )}
  </div>
)
