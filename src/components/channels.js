/* eslint-disable jsx-a11y/no-onchange */

import { h, Component } from 'preact'
import cx from 'classnames'
import slackFetch from '../lib/slack-fetch'
import styles from './channels.css'

export default class Channels extends Component {
  state = {
    channels: [],
    fetching: false,
    error: null
  }

  componentDidMount() {
    this.fetchChannels(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.token !== nextProps.token) {
      this.fetchChannels(nextProps)
    }
  }

  fetchChannels = (props) => {
    const { onChange, onError, token } = props

    onChange(null)
    onError(null)
    this.setState({ fetching: true, channels: [], error: null })

    slackFetch(
      `https://slack.com/api/channels.list?exclude_members=true&exclude_archived=true&token=${token}`
    )
      .then((data) => {
        const channels = data.channels.sort(
          (a, b) => b.num_members - a.num_members
        )

        onChange(channels.length ? channels[0] : null)

        this.setState({
          channels,
          error: null,
          fetching: false
        })
      })
      .catch((error) => {
        onChange(null)
        onError(error)

        this.setState({
          error,
          channels: [],
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
            <option>Error fetching channels</option>
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
