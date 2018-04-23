import { h, Component } from 'preact'
import styles from './message.css'

export default class Message extends Component {
  render({ message, onChange, placeholder, readonly }) {
    return (
      <input
        onFocus={(e) =>
          readonly ? (e.preventDefault(), e.target.blur()) : null
        }
        readonly={readonly}
        value={message}
        class={styles.inputMessage}
        placeholder={placeholder}
        onInput={(e) => onChange(e.target.value)}
      />
    )
  }
}
