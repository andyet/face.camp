import { h, Component } from 'preact'
import styles from './splash.css'

export default class Splash extends Component {
  render() {
    return (
      <div class={styles.container}>
        <p>what is this? we know, but we also dont...or just cant tell you</p>
        <p>Click it, you know you want to</p>
        <p>
          <a href="http://localhost:3000">Auth</a>
        </p>
      </div>
    )
  }
}
