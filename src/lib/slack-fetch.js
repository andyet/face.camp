// https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort#Browser_compatibility
// This polyfill can probably be removed once the last two versions of major browsers
// support AbortController. TODO: Update browser list in scripts/config.js when removing this
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'

const paginate = async (url, options, { total = 100, items = [] } = {}) => {
  url = new URL(url)

  const paths = url.pathname.split('/')
  const key = {
    'conversations.list': 'channels',
    'users.list': 'members'
  }[paths[paths.length - 1]]

  // Slack recommends no more than 200 items at a time
  url.searchParams.set('limit', Math.min(total, 200))

  const { [key]: newItems, response_metadata = {}, ...resp } = await slackFetch(
    url,
    options
  )

  const allItems = [...items, ...newItems]
  const nextCursor = response_metadata.next_cursor

  if (allItems.length < total && nextCursor) {
    url.searchParams.set('cursor', nextCursor)
    return await paginate(url, options, { total, items: allItems })
  }

  return {
    ...resp,
    [key]: allItems
  }
}

const slackFetch = async (url, options = {}) => {
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

  const res = await fetch(url, options)
  const data = await res.json()

  if (!data.ok || data.error) {
    const error = new Error(data.error)
    error.authError = [
      'not_authed',
      'invalid_auth',
      'account_inactive',
      'token_revoked',
      'no_permission',
      'org_login_required'
    ].includes(data.error)
    error.reauthError = data.error === 'token_revoked'
    throw error
  }

  return data
}

export default slackFetch
export { paginate }
