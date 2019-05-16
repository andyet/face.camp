import cssPresetEnv from 'postcss-preset-env'
import cssimport from 'postcss-import'
import { URL } from 'url'
import mergeHelpers, { env } from './config-helpers'

// See output from `npm run build:sizes` for the size of all possible builds
const USE_ES6 = env('USE_ES6', true)
const USE_OBJ_ASSIGN = env('USE_OBJ_ASSIGN', true)
const USE_ASYNC_ROUTES = env('USE_ASYNC_ROUTES', false)
const USE_MINIFY = env('USE_MINIFY', true)
const USE_SW = env('USE_SW', true)
const LEGACY_TOKEN = env('LEGACY_TOKEN', '')

export default (config, env, helpers) => {
  const h = mergeHelpers(config, helpers)

  // Set the supported browsers based on a flag. By default the browserslist in
  // package.json is set to recent versions of major browsers that also support
  // navigator.mediaDevices and abort controller. Last updated 2019-05-09
  // from https://caniuse.com/#feat=stream and https://caniuse.com/#feat=abortcontroller
  // Unsupported browsers are handled by the onerror handler in template.html
  // which will catch any syntax errors.
  const browsers = USE_ES6 ? env.pkg.browserslist : ['> 0.25%', 'IE >= 9']

  h.setEnvDefinition('LEGACY_TOKEN', env.production ? '' : LEGACY_TOKEN)

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
    // This preloads the main bundles and prefetches the gif capture chunk
    prefetch: env.production,
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
      '@babel/plugin-transform-react-jsx': { useBuiltIns: true },
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
