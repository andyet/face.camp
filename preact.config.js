import fs from 'fs'
import path from 'path'
import UglifyJsPlugin from 'uglifyjs-webpack-plugin'

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

const babelOptions = (p) => (typeof p === 'string' ? [p, {}] : p)

export default (config, env, helpers) => {
  const loaders = helpers.getLoaders(config)
  const html = helpers.getPluginsByName(config, 'HtmlWebpackPlugin')[0]
  const babel = helpers.getLoadersByName(config, 'babel-loader')[0]
  const uglify = helpers.getPluginsByName(config, 'UglifyJsPlugin')[0]

  // Change html plugin to use our own template from the root of the project
  helpers.setHtmlTemplate(config, 'template.html')
  html.plugin.options.preload = true

  // Remove any babel plugin that will transform Bbject.assign and change options
  // for other plugins to use Object.assign instead of a custom helper
  babel.rule.options.plugins = babel.rule.options.plugins
    .map((plugin) => {
      const [name, options] = babelOptions(plugin)

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

  // Read babel-preset-env supported browsers from the standard .browserslistrc
  // config file location
  babel.rule.options.presets = babel.rule.options.presets.map((preset) => {
    const [name, options] = babelOptions(preset)

    if (name.includes('/babel-preset-env/')) {
      // Helpful to see which browsers are being used
      // options.debug = true
      options.targets.browsers = fs
        .readFileSync(path.resolve(process.cwd(), '.browserslistrc'))
        .toString()
        .split('\n')
    }

    return preset
  })

  // Disable async route splitting for routes
  config.module.loaders.splice(
    loaders.find(
      ({ loaders }) =>
        typeof loaders === 'string' &&
        loaders.endsWith('async-component-loader')
    ).ruleIndex,
    1
  )

  // Use uglify-plugin v4 which uses uglify-es under the hood so it supports
  // transforming es6+. This only needs to be used if the browserslist config
  // supports not complining down to es5
  if (uglify) {
    config.plugins[uglify.index] = new UglifyJsPlugin(
      uglify3To4(uglify.plugin.options)
    )
  }

  // Where we're going we don't need polyfills
  delete config.entry.polyfills
}
