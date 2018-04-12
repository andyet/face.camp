const LS_KEY = 'facecamp-data'

export default () => {
  const { hash } = window.location

  if (hash && hash.length > 1) {
    try {
      const parsedData = JSON.parse(decodeURI(hash.slice(1)))
      localStorage.setItem(LS_KEY, JSON.stringify(parsedData))
      window.location.replace(window.location.href.split('#')[0])
      return true
    } catch (e) {
      return null
    }
  } else {
    let initData = null
    try {
      return JSON.parse(localStorage.getItem(LS_KEY))
    } catch (e) {
      localStorage.removeItem(LS_KEY)
      return null
    }
  }
}
