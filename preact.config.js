import UglifyJsPlugin from 'uglifyjs-webpack-plugin'

const env = (k) => (process.env[k] === 'true' ? true : false)
const COMPILE_TO_ES6 = env('COMPILE_TO_ES6')
const USE_OBJ_ASSIGN = env('USE_OBJ_ASSIGN')
const DISABLE_ASYNC_ROUTE = env('DISABLE_ASYNC_ROUTE')

const uglify3To4 = (v3) => {
  const v4 = { uglifyOptions: {} }
  Object.keys(v3).forEach((key) => {
    const value = v3[key]
    if (key === 'output' || key === 'mangle' || key === 'compress') {
      if (key === 'compress') {
        delete value.screw_ie8
        delete value.cascade
      }
      v4.uglifyOptions[key] = value
    } else {
      v4[key] = value
    }
  })
  return v4
}

export default (config, env, helpers) => {
  // Change html plugin to use our own template from the root of the project
  const html = helpers.getPluginsByName(config, 'HtmlWebpackPlugin')[0]
  helpers.setHtmlTemplate(config, 'template.html')
  html.plugin.options.preload = true
  html.plugin.options.minify.minifyJS = true
  delete config.entry.polyfills

  // Get babel loader for use in changing presets and plugins
  const babel = helpers.getLoadersByName(config, 'babel-loader')[0]

  if (USE_OBJ_ASSIGN) {
    // Remove any babel plugin that will transform Bbject.assign and change options
    // for other plugins to use Object.assign instead of a custom helper
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
  if (DISABLE_ASYNC_ROUTE) {
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

  if (COMPILE_TO_ES6) {
    // Set babel-preset-env supported browsers to versions that support
    // navigator.mediaDevices and last two versions
    babel.rule.options.presets = babel.rule.options.presets.map((preset) => {
      const [name, options] = typeof preset === 'string' ? [preset, {}] : preset

      if (name.includes('/babel-preset-env/')) {
        // options.debug = true // Helpful to see which browsers are being used
        options.targets.browsers = [
          'chrome 63',
          'edge 15',
          'firefox 58',
          'ios 11.3',
          'safari 11',
          'opera 50'
        ]
      }

      return preset
    })

    // Use uglify-plugin v4 which uses uglify-es under the hood so it supports
    // minifying es6+. This only needs to be used if the browserslist config
    // supports not compiling down to es5
    const uglify = helpers.getPluginsByName(config, 'UglifyJsPlugin')[0]
    if (uglify) {
      config.plugins[uglify.index] = new UglifyJsPlugin(
        uglify3To4(uglify.plugin.options)
      )
    }
  }
}
