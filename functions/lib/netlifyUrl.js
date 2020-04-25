const { productionUrl } = require('./config')

module.exports = (event, context) => {
  const { custom } = context.clientContext

  if (custom) {
    // Copied from https://github.com/depadiernos/deploy-id-test/blob/22dd145ac2d911fb7cba93e3a7edd8436f39a695/functions/getdeploy/getdeploy.js#L3
    const parsedData = JSON.parse(
      Buffer.from(custom.netlify, 'base64').toString('utf-8')
    )
    const siteUrl = parsedData.site_url
    return {
      siteUrl,
      production:
        new URL(siteUrl).toString() === new URL(productionUrl).toString()
    }
  }

  // This is only available when running netlify-lambda serve
  return {
    siteUrl: `https://${event.headers.host}`,
    production: false
  }
}
