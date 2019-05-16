# Contributing

## Issues

If you have any issues, [please open one](https://github.com/andyet/face.camp/issues/new)! There's an issue template to fill out that will make sure we have all the information we need to help.

## Pull Requests

Pull requests are very welcome! Here are a few things to keep in mind:

- The core feature of face.camp requires `navigator.mediaDevices.getUserMedia` which is supported in most [newer browsers](https://caniuse.com/#feat=stream). When culling these supported browsers down to the last couple versions of each, it becomes possible to ship ES2015+ code including `const`, `async/await` and arrow functions (`=>`). The specific list of supported browsers is specified in [`package.json#browserslist`](https://github.com/andyet/face.camp/blob/master/package.json#L5-L12). All polyfills and compiling of unsupported features is handled by `@babel/preset-env` and `postcss-preset-env`.
- One of the goals of this project is to keep the JS and CSS as light as possible. This is done with a combination of code splitting and carefully choosing which libraries to use. You can get an idea of the current build size by running `npm run build && npm run build:size`.
- The build process is handled by [`preact-cli`](https://github.com/developit/preact-cli) with some [other custom configuration](../scripts/config.js).
- The code gets linted with `prettier` and `eslint` which should both run automatically when committing any code.
