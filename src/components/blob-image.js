import { h, Component } from 'preact'

const createSrc = ({ src }) => (src ? URL.createObjectURL(src) : null)
const revokeSrc = ({ src }) => src && URL.revokeObjectURL(src)

export default class BlobImage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      src: createSrc(props)
    }
  }

  componentWillReceiveProps(nextProps) {
    // Only create new object urls if component is getting a new src blob
    if (this.props.src !== nextProps.src) {
      this.setState({ src: createSrc(nextProps) })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // Revoke urls if component just changed src blobs
    if (this.props.src !== prevProps.src && prevState.src) {
      revokeSrc(prevState)
    }
  }

  componentWillUnmount() {
    // Revoke url if component is unmounting
    revokeSrc(this.state)
  }

  render({ src: __, ...props }, { src }) {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} src={src} />
  }
}
