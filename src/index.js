import './style/index.css'

import { h, Component } from 'preact'

import auth from './lib/auth'
import App from './components/app'
import Splash from './components/splash'

if (module.hot) {
  require('preact/debug')
}

export default class Index extends Component {
  state = {
    auth: auth.get()
  }

  logout = () => {
    auth.delete()
    this.setState({ auth: null })
  }

  render(props, { auth }) {
    return (
      <div id="app">
        {auth ? <App {...auth} logout={this.logout} /> : <Splash />}
      </div>
    )
  }
}
