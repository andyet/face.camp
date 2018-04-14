export default (event, key, cb) => {
  const handler = (e) => {
    if (e.target.nodeName.toLowerCase() === 'input' || e.target.nodeName.toLowerCase() === 'textarea') {
      return undefined
    }
    if (e.key === key) {
      return cb(e)
    }
    return undefined
  }
  document.addEventListener(event, handler)
  return () => document.removeEventListener(event, handler)
}
