module.exports = (url) => ({
  statusCode: 302,
  headers: {
    Location: url
  },
  body: `Redirecting to ${url}`
})
