module.exports = (context) => {
  const data = context.clientContext.custom.netlify
  return JSON.parse(Buffer.from(data, 'base64').toString('utf-8'))
}
