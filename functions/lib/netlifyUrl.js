module.exports = (event, context) => {
  const { custom } = context.clientContext

  if (custom) {
    // Copied from https://github.com/depadiernos/deploy-id-test/blob/22dd145ac2d911fb7cba93e3a7edd8436f39a695/functions/getdeploy/getdeploy.js#L3
    const parsedData = JSON.parse(
      Buffer.from(custom.netlify, 'base64').toString('utf-8')
    )
    return parsedData.site_url
  }

  // This is only available when running netlify-lambda serve
  return `https://${event.headers.host}`
}
