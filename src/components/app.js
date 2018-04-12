import { h, Component } from 'preact'
import { Router } from 'preact-router'

import getToken from '../lib/token'
import Home from '../routes/home'

const token = getToken()

if (module.hot) {
  require('preact/debug')
}

export default class App extends Component {
  handleRoute = e => {
    this.currentUrl = e.url
  }

  render() {
    if (token === true) {
      // Render an empty app since the token is found and its redirecting
      return <div id="app" />
    }

    if (!token) {
      // No token so we need to click the link to the auth server
      return (
        <div id="app">
          <a href="http://localhost:3000">Auth</a>
        </div>
      )
    }

    return (
      <div id="app">
        <Router onChange={this.handleRoute}>
          <Home path="/" {...token} />
        </Router>
      </div>
    )
  }
}
