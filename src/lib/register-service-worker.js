export default () => {
  if (
    process.env.ADD_SW &&
    'serviceWorker' in navigator &&
    location.protocol === 'https:'
  ) {
    navigator.serviceWorker.register(__webpack_public_path__ + 'sw.js')
  }
}
