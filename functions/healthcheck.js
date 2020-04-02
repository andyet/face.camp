const config = require('getconfig')
const { version } = require('./package.json')

const { getconfig } = config

exports.handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({ version, env: getconfig.env })
  }
}
