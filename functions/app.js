const netlifyUrl = require('./lib/netlifyUrl')
const config = require('./lib/config')
const redirect = require('./lib/redirect')

const { appPath } = config

exports.handler = async (event, context) => {
  const { siteUrl } = netlifyUrl(event, context)
  return redirect(`${siteUrl}${appPath}`)
}
