const config = require('./config')
const { version } = require('./package.json')
const getNetlifyContext = require('./config/getNetlifyContext')

const { authHost, appUrl, clientId, clientSecret } = config

exports.handler = async (event, context) => {
  const netlify = getNetlifyContext(context)
  return {
    statusCode: 200,
    body: JSON.stringify({
      version,
      authHost,
      appUrl,
      clientId: !!clientId,
      clientSecret: !!clientSecret,
      netlify
    })
  }
}
