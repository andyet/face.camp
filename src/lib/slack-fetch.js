// https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort#Browser_compatibility
// This polyfill can probably be removed once the last two versions of major browsers
// support AbortController. TODO: Update browser list in scripts/config.js when removing this
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'

const paginate = async (method, options, { total = 200, items = [] } = {}) => {
  const [pathname, search] = method.split('?')

  const key = {
    'conversations.list': 'channels',
    'users.list': 'members'
  }[pathname]

  const params = new URLSearchParams(search)

  // Slack recommends no more than 200 items at a time
  params.set('limit', Math.min(total, 200))

  const { [key]: newItems, response_metadata = {}, ...resp } = await slackFetch(
    `${pathname}?${params}`,
    options
  )

  const allItems = [...items, ...newItems]
  const nextCursor = response_metadata.next_cursor

  if (allItems.length < total && nextCursor) {
    params.set('cursor', nextCursor)
    return await paginate(`${pathname}?${params}`, options, {
      total,
      items: allItems
    })
  }

  return {
    ...resp,
    [key]: allItems
  }
}

const formData = (data) => {
  const res = new FormData()
  Object.keys(data).forEach((key) => res.append(key, data[key]))
  return res
}

const slackFetch = async (url, options = {}) => {
  const { body } = options

  if (body && !(body instanceof FormData)) {
    options.body = formData(options.body)
  }

  const res = await fetch(new URL(url, 'https://slack.com/api/'), options)
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
