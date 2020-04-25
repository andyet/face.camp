require('dotenv').config()

module.exports = {
  productionUrl: 'https://face.camp',
  apiPath: `/_api`,
  appPath: '/',
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  devClientId: process.env.DEV_CLIENT_ID,
  devClientSecret: process.env.DEV_CLIENT_SECRET
}
