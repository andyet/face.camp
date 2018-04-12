const LS_KEY = 'facecamp-data'

const removeToken = () => {
  localStorage.removeItem(LS_KEY)
  return null
}

window.removeToken = removeToken

export default () => {
  const { hash } = window.location

  if (hash && hash.length > 1) {
    try {
      const parsedData = JSON.parse(decodeURI(hash.slice(1)))
      localStorage.setItem(LS_KEY, JSON.stringify(parsedData))
      window.location.hash = ''
      return parsedData
    } catch (e) {
      return removeToken()
    }
  } else {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY))
    } catch (e) {
      return removeToken()
    }
  }
}
