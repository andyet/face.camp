import { h, Component } from 'preact'

export default class Message extends Component {
  render({ onChange }) {
    return (
      <input
        placeholder="Add a message"
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }
}
