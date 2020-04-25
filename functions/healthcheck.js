const config = require('./lib/config')
const { version } = require('./package.json')
const netlifyUrl = require('./lib/netlifyUrl')

const {
  apiPath,
  appPath,
  clientId,
  clientSecret,
  devClientId,
  devClientSecret
} = config

exports.handler = async (event, context) => {
  const { siteUrl, production } = netlifyUrl(event, context)
  return {
    statusCode: 200,
    body: JSON.stringify({
      version,
      apiPath,
      appPath,
      siteUrl,
      production,
      clientId: !!clientId,
      clientSecret: !!clientSecret,
      devClientId: !!devClientId,
      devClientSecret: !!devClientSecret
    })
  }
}
