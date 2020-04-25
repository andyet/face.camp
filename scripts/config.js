import cssPresetEnv from 'postcss-preset-env'
import cssimport from 'postcss-import'
import { URL } from 'url'
import mergeHelpers, { env } from './config-helpers'
import { apiPath } from '../functions/lib/config'

// See output from `npm run build:sizes` for the size of all possible builds
const USE_ES6 = env('USE_ES6', true)
const USE_OBJ_ASSIGN = env('USE_OBJ_ASSIGN', true)
const USE_ASYNC_AWAIT = env('USE_ASYNC_AWAIT', true)
const USE_ASYNC_ROUTES = env('USE_ASYNC_ROUTES', true)
const USE_MINIFY = env('USE_MINIFY', true)
const USE_SW = env('USE_SW', true)

export default (config, env, helpers) => {
  const h = mergeHelpers(config, helpers)

  if (config.devServer) {
    config.devServer.port = 8080
    config.devServer.https = true
    config.devServer.proxy = {
      [apiPath]: {
        target: 'http://localhost:9000',
        pathRewrite: { [`^${apiPath}`]: '' }
      }
    }
  }

  // This env var is only added via a patch-package patch but is required otherwise
  // the service worker prevents routing to our api routes
  h.setEnvDefinition('SW_PATH_BLACKLIST', new RegExp(`${apiPath}/`))

  // Set the supported browsers based on a flag. By default the browserslist in
  // package.json is set to recent versions of major browsers that also support
  // navigator.mediaDevices and abort controller. Last updated 2019-05-09
  // from https://caniuse.com/#feat=stream and https://caniuse.com/#feat=abortcontroller
  // Unsupported browsers are handled by the onerror handler in template.html
  // which will catch any syntax errors.
  const browsers = USE_ES6 ? env.pkg.browserslist : ['> 0.25%', 'IE >= 9']

  // Change html plugin to use our own template from the root of the project
  h.setHtmlTemplate('scripts/template.html')

  // Pass in template data for opengraph and meta tags
  h.setHtmlOptions({
    title: 'Facecamp by &yet',
    description: env.pkg.description,
    author: env.pkg.author,
    url: env.pkg.homepage + (env.pkg.homepage.endsWith('/') ? '' : '/'),
    domain: new URL(env.pkg.homepage).host,
    logo: 'assets/icons/icon-no-padding.png',
    appleIcon: 'assets/icons/apple-touch-icon.png',
    preload: env.production,
    // Minify JS in the template since there's an inline onerror handler
    minify: USE_MINIFY ? { minifyJS: env.production } : false
  })

  // No polyfills needed for the supported browser list
  h.removeEntry('polyfills')

  // Use preset env plugin, this overrides preact-cli's autoprefixer plugin which is
  // ok because that is included in cssnext
  h.setPostCssOptions({
    plugins: [
      cssimport(),
      cssPresetEnv({
        browsers,
        stage: 3,
        features: {
          'nesting-rules': true,
          // TODO: remove this and use something else besides color-mod
          // https://github.com/jonathantneal/postcss-color-mod-function
          'color-mod-function': true,
          'custom-media-queries': true
        }
      })
    ]
  })

  // Set browsers which are assigned above based on USE_ES6 flag
  h.setBabelOptions('presets', {
    '@babel/preset-env': { targets: { browsers } }
  })

  if (USE_OBJ_ASSIGN) {
    h.setBabelOptions('plugins', {
      // Remove babel plugin that will transform Object.assign and change options
      // for other plugins to use Object.assign instead of a custom inline helper
      '@babel/plugin-transform-object-assign': null,
      '@babel/plugin-proposal-object-rest-spread': { useBuiltIns: true },
      '@babel/plugin-transform-react-jsx': { useBuiltIns: true }
    })
  }

  if (USE_ASYNC_AWAIT) {
    h.setBabelOptions('plugins', {
      // Remove fast-async because our browserslist all support native async/await
      'fast-async': null
    })
  }

  // Disable async route splitting for files in routes/ dir
  // Since the app doesn't have many routes, the bundle is best split by only
  // splitting the gif capture mode into a chunk
  if (!USE_ASYNC_ROUTES) h.removeAsyncRoutes()

  // Sometimes it is helpful when building a production version that we want
  // to test locally to disable minification and/or service workers
  if (!USE_MINIFY) h.removeMinimizers()
  if (!USE_SW || !env.production) h.removeServiceWorker()

  // Turn this on to see all the relevant config items that have been changed
  // h.debug()
}
