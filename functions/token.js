const rp = require('request-promise')
const config = require('./config')

const { clientId, clientSecret, authHost, appUrl } = config

exports.handler = async (event) => {
  const { error, code } = event.queryStringParameters

  if (error) {
    return { statusCode: 403, body: 'Error' }
  }

  const access = await rp({
    uri: 'https://slack.com/api/oauth.access',
    json: true,
    qs: {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: authHost + '/token'
    }
  })

  if (access.error || !access.ok) {
    return {
      statusCode: 403,
      body: access.error || 'Not ok'
    }
  }

  return {
    statuCode: 302,
    headers: {
      Location: `${appUrl}${
        // This makes it easier to test that we are redirecting with the proper
        // information since we cant access the url hash from the request. This
        // is a good thing as far as the app is concerned, but makes it impossible to test/
        process.env.NODE_ENV === 'test' ? '?query=' : '#'
      }${encodeURIComponent(JSON.stringify(access))}`
    }
  }
}
