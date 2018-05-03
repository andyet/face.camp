export default () =>
  'mediaDevices' in window.navigator &&
  typeof window.navigator.mediaDevices.getUserMedia === 'function'
