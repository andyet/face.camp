export default (event, key, element, cb) => {
  const handler = (e) => {
    if (e.target === document.body || e.target === element) {
      if (e.key === key) return cb(e)
    }
  }
  document.addEventListener(event, handler)
  return () => document.removeEventListener(event, handler)
}
