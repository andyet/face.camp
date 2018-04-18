export default () =>
  window.navigator &&
  window.navigator.mediaDevices &&
  typeof window.navigator.mediaDevices.getUserMedia === 'function'
