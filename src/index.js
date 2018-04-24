import { h, render } from 'preact'
import registerServiceWorker from './lib/register-service-worker'
import Container from './components/container'
import './index.css'

if (process.env.NODE_ENV === 'development') {
  require('preact/devtools')
}

if (module.hot) {
  require('preact/debug')
}

render(<Container />, document.getElementById('root'))
registerServiceWorker()
