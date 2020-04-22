const config = require('./config')
const { version } = require('./package.json')
const netlifyUrl = require('./config/netlifyUrl')

const { apiPath, appPath, clientId, clientSecret } = config

exports.handler = async (event, context) => {
  const siteUrl = netlifyUrl(context)
  return {
    statusCode: 200,
    body: JSON.stringify({
      version,
      apiPath,
      appPath,
      siteUrl,
      clientId: !!clientId,
      clientSecret: !!clientSecret
    })
  }
}
