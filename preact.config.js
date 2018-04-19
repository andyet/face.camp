export default (config, env, helpers) => {
  // Change html plugin to use our own template from the root of the project
  const htmlPlugin = helpers.getPluginsByName(config, 'HtmlWebpackPlugin')[0]
    .plugin
  htmlPlugin.options.template = htmlPlugin.options.template.replace(
    '/node_modules/preact-cli/lib/resources/template.html',
    '/template.html'
  )

  // Where we're going we don't need polyfills
  delete config.entry.polyfills
}
