const config = require('getconfig')

const { appUrl } = config

exports.handler = async () => {
  return {
    statusCode: 302,
    headers: {
      Location: appUrl
    }
  }
}
