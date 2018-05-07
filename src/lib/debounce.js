// Simple debounce function that always waits for the trailing edge to call the func
// https://davidwalsh.name/javascript-debounce-function
export default (func, wait) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      timeout = null
      func(...args)
    }, wait)
  }
}
