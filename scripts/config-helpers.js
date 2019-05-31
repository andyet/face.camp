import { merge, omit } from 'lodash'

const moreHelpers = {
  getMinimizersByName(config, name) {
    return (config.optimization.minimizer || [])
      .filter((minimizer) => {
        return minimizer.constructor.name === name
      })
      .map((minimizer, index) => ({ minimizer, index }))
  },
  setBabelOptions(config, type, getOptions) {
    const names = Object.keys(getOptions)

    this.getLoadersByName('babel-loader').forEach(
      (babel) =>
        (babel.rule.options[type] = babel.rule.options[type]
          .map((p) => {
            const [name, options] = typeof p === 'string' ? [p, {}] : p
            const nameIndex = names.findIndex((key) => name.includes(key))

            if (nameIndex > -1) {
              const newOptions = getOptions[names[nameIndex]]
              return newOptions === null
                ? null
                : [name, merge(options, newOptions)]
            }

            return p
          })
          .filter(Boolean))
    )
  },
  removeRule(config, rule) {
    rule && config.module.rules.splice(rule.index, 1)
  },
  removePlugin(config, plugin) {
    plugin && config.plugins.splice(plugin.index, 1)
  },
  addPlugin(config, plugin) {
    config.plugins.push(plugin)
  },
  removeEntry(config, entry) {
    delete config.entry[entry]
  },
  removeMinimizers(config) {
    config.optimization.minimizer = []
  },
  removeServiceWorker(config) {
    ;[
      ...this.getPluginsByName('InjectManifest'),
      ...this.getPluginsByName('SWBuilderPlugin')
    ].forEach((p) => this.removePlugin(p))

    this.setEnvDefinition('ADD_SW', false)
  },
  setEnvDefinition(config, key, value) {
    const envKey = `process.env.${key}`
    const plugins = this.getPluginsByName('DefinePlugin')

    // Get all define plugins that have a definition for that key
    const pluginsWithDefinition = plugins.filter(({ plugin }) =>
      plugin.definitions.hasOwnProperty(envKey)
    )

    // If there are none found, then just alter the first plugin found
    const alterPlugins = pluginsWithDefinition.length
      ? pluginsWithDefinition
      : plugins.slice(0, 1)

    alterPlugins.forEach(({ plugin }) => {
      plugin.definitions[envKey] = JSON.stringify(value)
    })
  },
  removeAsyncRoutes(config) {
    const jsRules = this.getRulesByMatchingFile('src/routes/home.js')
    jsRules.forEach(({ rule, index }) => {
      if (
        typeof rule.loader === 'string' &&
        rule.loader.includes('@preact/async-loader')
      ) {
        this.removeRule({ index })
      }
    })
  },
  setTerserOptions(config, options) {
    this.getMinimizersByName('TerserPlugin').forEach(({ minimizer }) => {
      merge(minimizer.options, options)
    })
  },
  setPostCssOptions(config, options) {
    this.getLoadersByName('postcss-loader').forEach(({ loader }) =>
      merge(loader.options, options)
    )
  },
  setHtmlOptions(config, options) {
    this.getPluginsByName('HtmlWebpackPlugin').forEach((html) =>
      merge(html.plugin.options, options)
    )
  },
  debug(config) {
    const plugins = this.getPlugins()
    const htmls = this.getPluginsByName('HtmlWebpackPlugin')
    const babels = this.getLoadersByName('babel-loader')
    const uglifys = this.getMinimizersByName('UglifyJsPlugin')
    const postcss = this.getLoadersByName('postcss-loader')
    const js = this.getRulesByMatchingFile('file.js')

    const debug = {
      plugins: plugins.map(({ plugin }) => plugin.constructor.name),
      html: htmls.map(({ plugin }) => omit(plugin.options, 'config')),
      postcss: postcss.map(({ loader }) => loader.options),
      js: js.map(({ rule }) => rule.loader),
      'babel-presets': babels.map(({ rule }) => rule.options.presets),
      'babel-plugins': babels.map(({ rule }) => rule.options.plugins),
      min: uglifys.map(({ minimizer }) => minimizer.options)
    }

    process.stdout.write(JSON.stringify(debug, null, 2) + '\n')
    throw new Error('Stopping to debug config')
  }
}

export default (config, helpers) => {
  const res = {}

  // Bind all methods from helpers to themselves with the config as the
  // first argument
  const proto = Object.getPrototypeOf(helpers)
  for (let name of Object.getOwnPropertyNames(proto)) {
    const method = helpers[name]
    const descriptor = Object.getOwnPropertyDescriptor(proto, name)

    if (descriptor.value instanceof Function && name !== 'constructor') {
      res[name] = method.bind(helpers, config)
    }
  }

  // Also bind all methods in moreHelpers the same way so that they can call
  // the other helpers by using `this`
  Object.keys(moreHelpers).forEach((name) => {
    const method = moreHelpers[name]
    res[name] = method.bind(res, config)
  })

  return res
}

export const env = (k, def) =>
  k in process.env
    ? def === true || def === false
      ? process.env[k] !== 'false'
      : process.env[k]
    : def
