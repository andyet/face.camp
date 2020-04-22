const netlifyUrl = require('./config/netlifyUrl')
const config = require('./config')

const { appPath } = config

exports.handler = async (event, context) => {
  const siteUrl = netlifyUrl(context)
  return {
    statusCode: 302,
    headers: {
      Location: `${siteUrl}${appPath}`
    }
  }
}
