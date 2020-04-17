const config = require('./config')

const { appUrl } = config

exports.handler = async () => {
  return {
    statusCode: 302,
    headers: {
      Location: appUrl
    }
  }
}
