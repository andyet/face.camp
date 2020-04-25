const qs = require('qs')
const config = require('./lib/config')
const netlifyUrl = require('./lib/netlifyUrl')
const redirect = require('./lib/redirect')

const { clientId, devClientId, apiPath } = config

exports.handler = async (event, context) => {
  // App can always post files
  const scope = ['files:write:user']

  const { types = '' } = event.queryStringParameters
  if (types && typeof types === 'string') {
    scope.push(
      ...['channels', 'groups', 'im', 'mpim']
        .filter((type) => types.split(',').includes(type))
        .map((type) =>
          `${type === 'im' ? 'users:read' : ''} ${type}:read`.trim()
        )
    )
  }

  // If no other scopes have been added then add channels read to allow
  // the app to work. This allows the client to request other scopes without
  // public channels
  if (scope.length === 1) {
    scope.push('channels:read')
  }

  const { siteUrl, production } = netlifyUrl(event, context)

  const redirectUrl = `https://slack.com/oauth/authorize?${qs.stringify({
    client_id: production ? clientId : devClientId,
    redirect_uri: `${siteUrl}${apiPath}/token`,
    scope: scope.join(' ')
  })}`

  return redirect(redirectUrl)
}
