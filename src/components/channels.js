/* eslint-disable jsx-a11y/no-onchange */

import { h, Component } from 'preact'
import cx from 'classnames'
import url from '../lib/url-qs'
import styles from './channels.css'

export default class Channels extends Component {
  state = {
    channels: [],
    fetching: false,
    error: null
  }

  componentDidMount() {
    this.fetchChannels()
  }

  fetchChannels = () => {
    const { onChange, token } = this.props

    this.setState({ fetching: true })

    fetch(
      url('https://slack.com/api/channels.list', {
        exclude_members: true,
        exclude_archived: true,
        token
      })
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.error || !data.ok) {
          return this.setState({
            fetching: false,
            error: data.error || 'Error finding channels'
          })
        }

        const channels = data.channels.sort(
          (a, b) => b.num_members - a.num_members
        )

        onChange(channels[0])

        this.setState({
          channels,
          error: null,
          fetching: false
        })
      })
  }

  render({ onChange }, { fetching, error, channels }) {
    return (
      <div class={styles.selectChannel}>
        <select
          class={cx(styles.select, {
            [styles.error]: !!error,
            [styles.loading]: fetching,
            [styles.empty]: !channels.length
          })}
          onChange={(e) =>
            onChange(channels.find((c) => c.id === e.target.value))
          }
        >
          {error ? (
            <option>Error: {error}</option>
          ) : fetching ? (
            <option>Loading channels</option>
          ) : !channels.length ? (
            <option>No channels</option>
          ) : (
            channels.map((c) => (
              <option key={c.id} value={c.id}>
                #{c.name}
              </option>
            ))
          )}
        </select>
      </div>
    )
  }
}
