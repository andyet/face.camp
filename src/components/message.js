import { h, Component } from 'preact'
import styles from './message.css'

export default class Message extends Component {
  render({ message, onChange, placeholder }) {
    return (
      <input
        value={message}
        class={styles.inputMessage}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }
}
