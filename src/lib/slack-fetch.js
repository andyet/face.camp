const AUTH_ERRORS = [
  'not_authed',
  'invalid_auth',
  'account_inactive',
  'token_revoked',
  'no_permission',
  'org_login_required'
]

export default (url, options = {}) => {
  const { body } = options

  if (body && !(body instanceof FormData)) {
    const formData = new FormData()

    Object.keys(body).forEach((key) => {
      let value = body[key]
      if (typeof value === 'object' && !(value instanceof Blob)) {
        value = JSON.stringify(value)
      }
      formData.append(key, value)
    })

    options.body = formData
  }

  return fetch(url, options)
    .then((res) => res.json())
    .then((res) => {
      if (!res.ok || res.error) {
        const error = new Error(res.error)
        error.slackAuth = AUTH_ERRORS.includes(res.error)
        throw error
      }
      return res
    })
}
