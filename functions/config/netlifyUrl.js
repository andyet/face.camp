module.exports = (context) => {
  const data = context.clientContext.custom.netlify
  const parsedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'))
  return parsedData.site_url
}
