import { h } from 'preact'
import Splash from '../components/splash'
import styles from '../components/splash.css'

export default () => (
  <Splash>
    <p class={styles.content}>
      &yet will never gather, store, or sell information about you or your team,
      log your messages or gifs, or engage in any other behavior that would
      compromise your privacy and security in any way. Facecamp optionally
      requests access to your team’s public and private channels, direct
      messages, and user information only to display a list of conversations to
      upload gifs to, and this information is only requested through a browser
      and used to communicate directly with Slack’s API. All of these accesses
      are optional and can be disabled by logging out and opting out of their
      use on any future authorization attempts. Facecamp is a static web
      application with no database, so your gifs and messages are uploaded
      directly to Slack with no data passing through our servers.
    </p>
  </Splash>
)
