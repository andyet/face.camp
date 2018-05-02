export default () => ({
  ios: /\biPhone.*Mobile|\biPod|\biPad|AppleCoreMedia/.test(
    window.navigator.userAgent
  ),
  standalone: 'standalone' in window.navigator
})
