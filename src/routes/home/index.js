import { h, Component } from 'preact'
import style from './style.css'

export default class Home extends Component {
  componentDidMount(...args) {
    console.log(this.props)
    console.log(args)
  }

  render() {
    return (
      <div class={style.home}>
        <input placeholder="text" type="text" />
        <button>Post</button>
      </div>
    )
  }
}
