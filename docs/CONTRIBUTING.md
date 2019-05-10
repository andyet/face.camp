# Contributing

## Issues

## Pull Requests

Pull requests are very welcome! Here are a few things to keep in mind:

- The core feature of face.camp requires `navigator.mediaDevices.getUserMedia` which is supported in most [newer browsers](https://caniuse.com/#feat=stream). When culling these supported browsers down to the last couple versions of each, it becomes possible to ship ES2015+ code including `const`, `async/await` and arrow functions (`=>`). The specific list of supported browsers is specified in [`package.json#browserslist`](https://github.com/andyet/face.camp/blob/master/package.json#L5-L12).
- One of the goals of this project is to keep the JS and CSS as light as possible. This is done with a combination of code splitting and carefully choosing which libraries to use.
