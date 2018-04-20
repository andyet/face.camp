import { h, Component, render } from 'preact'
import registerServiceWorker from './lib/register-service-worker'
import Container from './components/container'
import './index.css'

if (process.env.NODE_ENV === 'development') {
  require('preact/devtools')
}

if (module.hot) {
  require('preact/debug')
}

try {
  render(<Container />, document.getElementById('root'))
  registerServiceWorker()
} catch (e) {
  document.getElementById('root').innerHTML =
    '<h1>This browser is not supported</h1>'
}
