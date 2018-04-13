import { h, Component } from 'preact'
import styles from './splash.css'

export default class Splash extends Component {
  render() {
    return (
      <div class={styles.container}>
        <div class={styles.logo}>
          <img src={'/assets/images/logo-facecamp.svg'} />
        </div>
        <p>what is this? we know, but we also dont...or just cant tell you</p>
        <p>Click it, you know you want to</p>
        <p>
          <a class={styles.btnSlackAuth} href="http://localhost:3000">
            Login with Slack
          </a>
        </p>
      </div>
    )
  }
}
