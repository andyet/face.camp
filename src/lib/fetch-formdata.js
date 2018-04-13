export default (url, options) => {
  const formData = new FormData()

  Object.keys(options.data).forEach((key) => {
    let value = options.data[key]
    if (typeof value === 'object' && !(value instanceof Blob)) {
      value = JSON.stringify(value)
    }
    formData.append(key, value)
  })

  delete options.data

  return fetch(url, { body: formData, ...options })
    .then((res) => res.json())
    .then((res) => {
      if (!res.ok) {
        throw res.error
      }
      return res
    })
}
