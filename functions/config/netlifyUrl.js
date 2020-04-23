// Copied from https://github.com/depadiernos/deploy-id-test/blob/22dd145ac2d911fb7cba93e3a7edd8436f39a695/functions/getdeploy/getdeploy.js#L3
module.exports = (context) => {
  const data = context.clientContext.custom.netlify
  const parsedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'))
  return parsedData.site_url
}
