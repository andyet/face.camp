export default (location, params) => {
  const url = new URL(location)
  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key])
  )
  return url
}
