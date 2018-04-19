export default (config, env, helpers) => {
  // Change html plugin to use our own template from the root of the project
  const htmlPlugin = helpers.getPluginsByName(config, 'HtmlWebpackPlugin')[0]
    .plugin
  htmlPlugin.options.template = htmlPlugin.options.template.replace(
    '/node_modules/preact-cli/lib/resources/template.html',
    '/template.html'
  )

  const babelLoader = helpers.getLoadersByName(config, 'babel-loader')[0].rule
  babelLoader.options.plugins = babelLoader.options.plugins
    .map((plugin) => {
      const [name, options] = typeof plugin === 'string' ? [plugin, {}] : plugin

      if (name.includes('transform-object-assign/')) {
        return null
      }

      if (
        name.includes('transform-object-rest-spread/') ||
        name.includes('transform-react-jsx/')
      ) {
        options.useBuiltIns = true
        return [name, options]
      }

      return plugin
    })
    .filter(Boolean)

  // Where we're going we don't need polyfills
  delete config.entry.polyfills
}
