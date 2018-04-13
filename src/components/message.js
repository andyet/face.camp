import { h, Component } from 'preact'
import styles from './message.css'

export default class Message extends Component {
  render({ onChange, placeholder }) {
    return (
      <input
        class={styles.inputMessage}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }
}
