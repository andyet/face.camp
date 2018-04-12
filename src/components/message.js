import { h, Component } from 'preact'
import styles from './message.css'

export default class Message extends Component {
  render({ onChange }) {
    return (
      <input class={styles.inputMessage}
        placeholder="Add a message"
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }
}
