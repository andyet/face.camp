import { h } from 'preact'
import cx from 'classnames'
import styles from './message.css'

export default (props) => (
  <input
    {...props}
    onFocus={(e) =>
      props.readonly ? (e.preventDefault(), e.target.blur()) : null
    }
    class={cx(styles.inputMessage, props.class)}
  />
)
