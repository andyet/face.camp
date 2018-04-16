const LS_KEY = 'facecamp-data'

export default {
  get(hash) {
    if (hash && hash.length > 1) {
      try {
        const parsedData = JSON.parse(decodeURI(hash.slice(1)))
        localStorage.setItem(LS_KEY, JSON.stringify(parsedData))
        window.location.hash = ''
        return parsedData
      } catch (e) {
        return this.removeToken()
      }
    } else {
      try {
        return JSON.parse(localStorage.getItem(LS_KEY))
      } catch (e) {
        return this.removeToken()
      }
    }
  },
  delete() {
    localStorage.removeItem(LS_KEY)
    return null
  }
}
