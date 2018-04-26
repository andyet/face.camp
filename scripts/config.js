import UglifyJsPlugin from 'uglifyjs-webpack-plugin'
import path from 'path'

// See output from `npm run build:sizes` for the size of all possible builds
const env = (k, def) => (k in process.env ? process.env[k] !== 'false' : def)
const USE_ES6 = env('USE_ES6', true)
const USE_OBJ_ASSIGN = env('USE_OBJ_ASSIGN', true)
const USE_ASYNC_ROUTES = env('USE_ASYNC_ROUTES', false)
const USE_MINIFY = env('USE_MINIFY', true)

// uglifyjs plugin has different allowed options for v3 and v4. This massages
// the v3 config into the closest possible equivalent v4 config
const uglify3To4 = (v3) => {
  const v4 = { uglifyOptions: { ecma: 6 } }
  Object.keys(v3).forEach((key) => {
    const value = v3[key]
    if (key === 'output' || key === 'mangle' || key === 'compress') {
      if (key === 'compress') {
        // These aren't allowed in v4
        delete value.screw_ie8
        delete value.cascade
        // This keeps uglify from breaking preact component mounting
        // https://github.com/developit/preact/issues/961#issuecomment-358615579
        value.reduce_vars = false
      }
      v4.uglifyOptions[key] = value
    } else {
      v4[key] = value
    }
  })
  return v4
}

export default (config, env, helpers) => {
  const html = helpers.getPluginsByName(config, 'HtmlWebpackPlugin')[0]
  // Change html plugin to use our own template from the root of the project
  helpers.setHtmlTemplate(config, 'scripts/template.html')
  // This preloads the gif capture chunk when the user hits the unauthed landing
  html.plugin.options.preload = env.production
  // Minify JS in the template since there's an inline onerror handler
  if (env.production) html.plugin.options.minify.minifyJS = true

  // No polyfills needed for the supported browser list
  delete config.entry.polyfills

  // Use our own entry point instead of preact-cli-entrypoint
  config.entry.bundle = path.resolve(process.cwd(), 'src', 'index.js')

  // Get babel loader for use in changing presets and plugins
  const babel = helpers.getLoadersByName(config, 'babel-loader')[0]

  // Get uglify plugin to change options on
  const uglify = helpers.getPluginsByName(config, 'UglifyJsPlugin')[0]

  // Remove babel plugin that will transform Object.assign and change options
  // for other plugins to use Object.assign instead of a custom inline helper
  if (USE_OBJ_ASSIGN) {
    babel.rule.options.plugins = babel.rule.options.plugins
      .map((plugin) => {
        const [name, options] =
          typeof plugin === 'string' ? [plugin, {}] : plugin

        if (name.includes('/babel-plugin-transform-object-assign/')) {
          return null
        }

        if (
          name.includes('/babel-plugin-transform-object-rest-spread/') ||
          name.includes('/babel-plugin-transform-react-jsx/')
        ) {
          options.useBuiltIns = true
        }

        return plugin
      })
      .filter(Boolean)
  }

  // Disable async route splitting for files in routes/ dir
  // Since the app doesn't have many routes, the bundle is best split by only
  // splitting the gif capture mode into a chunk
  if (!USE_ASYNC_ROUTES) {
    config.module.loaders.splice(
      helpers
        .getLoaders(config)
        .find(
          ({ loaders }) =>
            typeof loaders === 'string' &&
            loaders.endsWith('async-component-loader')
        ).ruleIndex,
      1
    )
  }

  // This flag will make Babel's compile target into ES6+. This relies on the
  // `onerror` handler in template.html which will catch syntax errors in unsupported
  // browsers
  if (USE_ES6) {
    // Set babel-preset-env supported browsers to recent versions of major
    // browsers that also support navigator.mediaDevices
    // Last updated 2018-04-24 from https://caniuse.com/#feat=stream
    babel.rule.options.presets = babel.rule.options.presets.map((preset) => {
      const [name, options] = typeof preset === 'string' ? [preset, {}] : preset

      if (name.includes('/babel-preset-env/')) {
        // Helpful to see which browsers are being used
        // options.debug = true
        options.targets.browsers = [
          'chrome 63',
          'edge 15',
          'firefox 58',
          'ios 11.2',
          'safari 11',
          'opera 50'
        ]
      }

      return preset
    })

    // Use uglify-plugin v4 which uses uglify-es under the hood so it supports
    // minifying es6+. This only needs to be used if the browserslist config
    // supports not compiling down to es5
    if (uglify) {
      config.plugins[uglify.index] = new UglifyJsPlugin(
        uglify3To4(uglify.plugin.options)
      )
    }
  }

  if (!USE_MINIFY) {
    config.plugins.splice(uglify.index, 1)
  }
}
