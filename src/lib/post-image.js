import slug from './slug'
import ts from './timestamp'
import slackFetch from './slack-fetch'

export default ({ access_token, title, channel, image }, options = {}) =>
  slackFetch('files.upload', {
    ...options,
    method: 'POST',
    body: {
      token: access_token,
      title,
      channels: channel,
      filetype: 'gif',
      filename: `${ts()} ${slug(title).substring(0, 240)}.gif`,
      file: image
    }
  })
