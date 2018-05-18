import { h, Component } from 'preact'
import cx from 'classnames'
import styles from './auth-button.css'

export default class AuthButton extends Component {
  state = {
    groups: false,
    im: false,
    mpim: false,
    channels: true
  }

  static defaultProps = {
    types: [
      { label: 'Public Channels', name: 'channels' },
      { label: 'Private Channels', name: 'groups' },
      { label: 'DMs', name: 'im' },
      { label: 'Multiparty DMs', name: 'mpim' }
    ]
  }

  getTypes = () =>
    this.props.types
      .filter(({ name }) => this.state[name])
      .map(({ name }) => name)
      .join(',')

  getHref = () => {
    const { url } = this.props

    const typeValues = this.getTypes()

    if (!typeValues) return

    return `${url}${typeValues ? `?types=${typeValues}` : ''}`
  }

  render({ types }) {
    return (
      <div class={styles.container}>
        <a
          class={cx(styles.btnSlackAuth, {
            [styles.disabled]: !this.getHref()
          })}
          href={this.getHref()}
        >
          Login with Slack
        </a>
        <div class={styles.authDescription}>
          <p class={styles.authTitle}>Allow posting to</p>
          {types.map(({ name, label }) => (
            <p key={name}>
              <label htmlFor={name} for={name}>
                <input
                  class={styles.checkbox}
                  onChange={(e) => this.setState({ [name]: e.target.checked })}
                  checked={this.state[name]}
                  type="checkbox"
                  name={name}
                  id={name}
                />
                {label}
                <br />
              </label>
            </p>
          ))}
        </div>
      </div>
    )
  }
}
