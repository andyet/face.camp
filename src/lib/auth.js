const LS_KEY = 'facecamp-data'

const url =
  process.env.NODE_ENV === 'production'
    ? 'https://auth.face.camp'
    : `http://${window.location.hostname}:3000`

export default {
  url,
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
