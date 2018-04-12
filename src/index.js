import './style/index.css'

import { h, Component } from 'preact'
import { Router } from 'preact-router'

import getToken from './lib/token'
import Home from './routes/home'
import Splash from './components/splash'

const token = getToken()

if (module.hot) {
  require('preact/debug')
}

export default class App extends Component {
  handleRoute = (e) => {
    this.currentUrl = e.url
  }

  render() {
    if (!token) {
      return <Splash />
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
