import { h, Component } from 'preact'

const toClasses = (props) =>
  Array.isArray(props.class) ? props.class : [props.class]

export default class BodyClass extends Component {
  componentDidMount(nextProps) {
    this.setBodyClass(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.class !== this.props.class) {
      this.removeBodyClass(this.props)
      this.setBodyClass(nextProps)
    }
  }

  componentWillUnmount() {
    this.removeBodyClass(this.props)
  }

  setBodyClass = (props) => {
    document.documentElement.classList.add(...toClasses(props))
  }

  removeBodyClass = (props) => {
    document.documentElement.classList.remove(...toClasses(props))
  }

  render({ children }) {
    return <span>{children}</span>
  }
}
