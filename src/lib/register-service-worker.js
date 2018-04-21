export default () => {
  if (
    process.env.NODE_ENV !== 'development' &&
    process.env.ADD_SW &&
    'serviceWorker' in navigator &&
    location.protocol === 'https:'
  ) {
    navigator.serviceWorker.register(__webpack_public_path__ + 'sw.js')
  }
}
