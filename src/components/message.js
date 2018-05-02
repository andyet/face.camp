import { h, Component } from 'preact'
import cx from 'classnames'
import styles from './message.css'

export default class Message extends Component {
  render(props) {
    return (
      <input
        {...props}
        onFocus={(e) =>
          props.readonly ? (e.preventDefault(), e.target.blur()) : null
        }
        class={cx(styles.inputMessage, props.class)}
      />
    )
  }
}
