import { h, Component } from 'preact'
import styles from './splash.css'

const auth =
  process.env.NODE_ENV === 'production'
    ? 'https://auth.face.camp'
    : `http://${window.location.hostname}:3000`

export default class Splash extends Component {
  render() {
    return (
      <div class={styles.container}>
        <div>
          <div class={styles.logoFacecamp}>
            <img src={'/assets/images/logo-facecamp.svg'} alt="Facecamp logo" />
          </div>
          <h1>Chat your mug</h1>
          <p> Sign in with:</p>
          <p>
            <a class={styles.btnSlackAuth} href={auth}>
              Login with Slack
            </a>
          </p>
          <p class={styles.byline}>
            from your friends at{' '}
            <a class={styles.logoAndyet} href="https://andyet.com">
              &yet
            </a>
          </p>
        </div>
      </div>
    )
  }
}
