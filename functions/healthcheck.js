const config = require('./config')
const { version } = require('./package.json')

const { authHost, appUrl, clientId, clientSecret } = config

exports.handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      version,
      authHost,
      appUrl,
      clientId: !!clientId,
      clientSecret: !!clientSecret
    })
  }
}
