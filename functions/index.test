const http = require('http')
const test = require('ava')
const listen = require('test-listen')
const request = require('request-promise')
const nock = require('nock')
const facecampAuth = require('./index')

const serviceEndpoint = async (endpoint) => {
  const service = new http.Server(facecampAuth)

  const baseUrl = await listen(service)
  const url = new URL(endpoint, baseUrl)

  return {
    baseUrl,
    request: () => request(url.toString()),
    close: () => service.close()
  }
}

test('healtcheck', async (t) => {
  const endpoint = await serviceEndpoint('/healthcheck')
  const body = await endpoint.request()

  t.deepEqual(JSON.parse(body), {
    version: require('./package.json').version,
    env: 'test'
  })

  endpoint.close()
})

test('app redirect', async (t) => {
  const endpoint = await serviceEndpoint('/app')

  nock('https://appurl.test')
    .get('/')
    .reply('200', 'Redirected to app')

  t.deepEqual(await endpoint.request(), 'Redirected to app')

  endpoint.close()
})

test('default auth', async (t) => {
  const endpoint = await serviceEndpoint('/')

  nock('https://slack.com')
    .get('/oauth/authorize')
    .query({
      client_id: '1',
      client_secret: '2',
      redirect_uri: 'https://authhost.test/token',
      scope: 'files:write:user channels:read'
    })
    .reply(200, 'Redirected to slack')

  t.deepEqual(await endpoint.request(), 'Redirected to slack')

  endpoint.close()
})

test('auth with all types', async (t) => {
  const endpoint = await serviceEndpoint('/?types=channels,groups,im,mpim')

  nock('https://slack.com')
    .get('/oauth/authorize')
    .query({
      client_id: '1',
      client_secret: '2',
      redirect_uri: 'https://authhost.test/token',
      scope:
        'files:write:user channels:read groups:read users:read im:read mpim:read'
    })
    .reply(200, 'Redirected to slack')

  t.deepEqual(await endpoint.request(), 'Redirected to slack')

  endpoint.close()
})

test('auth with only im', async (t) => {
  const endpoint = await serviceEndpoint('/?types=im')

  nock('https://slack.com')
    .get('/oauth/authorize')
    .query({
      client_id: '1',
      client_secret: '2',
      redirect_uri: 'https://authhost.test/token',
      scope: 'files:write:user users:read im:read'
    })
    .reply(200, 'Redirected to slack')

  t.deepEqual(await endpoint.request(), 'Redirected to slack')

  endpoint.close()
})

test('redirect from token', async (t) => {
  const endpoint = await serviceEndpoint('/token?code=123')

  nock('https://slack.com')
    .get('/api/oauth.access')
    .query({
      code: '123',
      client_id: '1',
      client_secret: '2',
      redirect_uri: 'https://authhost.test/token'
    })
    .reply(200, { ok: true, access_token: 100 })

  nock('https://appurl.test')
    .get('/')
    .query({ query: JSON.stringify({ ok: true, access_token: 100 }) })
    .reply('200', 'Redirected to app')

  t.deepEqual(await endpoint.request(), 'Redirected to app')

  endpoint.close()
})

test('token error', async (t) => {
  const endpoint = await serviceEndpoint('/token?error=badstuff')

  await t.throwsAsync(endpoint.request, '403 - "Error"')

  endpoint.close()
})

test('token oauth error', async (t) => {
  const endpoint = await serviceEndpoint('/token?code=123')

  nock('https://slack.com')
    .get('/api/oauth.access')
    .query({
      code: '123',
      client_id: '1',
      client_secret: '2',
      redirect_uri: 'https://authhost.test/token'
    })
    .reply(200, { ok: false, error: 'Slack said no' })

  await t.throwsAsync(endpoint.request, '403 - "Slack said no"')

  endpoint.close()
})
