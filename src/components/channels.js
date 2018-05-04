/* eslint-disable jsx-a11y/no-onchange */

import { h } from 'preact'
import cx from 'classnames'
import styles from './channels.css'

export default ({ onChange, selected, fetching, error, channels }) => (
  <div class={styles.selectChannel}>
    <select
      class={cx(styles.select, {
        [styles.error]: !!error,
        [styles.loading]: fetching,
        [styles.empty]: !channels.length
      })}
      onChange={onChange}
    >
      {error ? (
        <option>Error fetching channels</option>
      ) : fetching ? (
        <option>Loading channels</option>
      ) : !channels.length ? (
        <option>No channels</option>
      ) : (
        channels.map((c) => (
          <option key={c.id} value={c.id} selected={c.id === selected}>
            #{c.name}
          </option>
        ))
      )}
    </select>
  </div>
)
