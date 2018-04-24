/* global __webpack_public_path__:false */

export default () => {
  if (
    process.env.NODE_ENV !== 'development' &&
    process.env.ADD_SW &&
    typeof window !== 'undefined' &&
    'serviceWorker' in window.navigator &&
    window.location.protocol === 'https:'
  ) {
    navigator.serviceWorker.register(__webpack_public_path__ + 'sw.js')
  }
}
