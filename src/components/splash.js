import { h } from 'preact'
import styles from './splash.css'
import logo from '../images/logo-facecamp.svg'

export default ({ children }) => (
  <div class={styles.container}>
    <div>
      <a class={styles.logoFacecamp} href="/">
        <img src={logo} alt="Facecamp logo" />
      </a>
      <h1 class={styles.title}>Chat your mug</h1>
      {children}
      <p class={styles.byline}>
        from your friends at{' '}
        <a class={styles.logoAndyet} href="https://andyet.com">
          &yet
        </a>
        <br />
        <a href="/privacy">privacy policy</a>
      </p>
    </div>
  </div>
)
