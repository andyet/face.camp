<p align="center">
  <img alt="face.camp logo" src="./src/assets/icons/icon-no-padding.png" />
</p>

# [face.camp]

Facecamp lets you take an animated gif from desktop or mobile by connecting the app to Slack and then visiting [face.camp] to post yourself to Slack for your teamies to see.

## Developing Locally

1. `npm install`

### Using your production face.camp token

If you only want to develop the UI (and not any of the server functions), the easiest way to do that is to take your token from [face.camp] and paste it into your locally running app.

1. Start the local app with `npm start`
1. Go to [face.camp] and if you are not authenticated, complete the login flow to signin with Slack
1. Open the developer console and paste the following and press Enter:

```
((k)=>copy(`localStorage.setItem('${k}',${JSON.stringify(localStorage.getItem(k))})`))('facecamp-data')
```

4. This will copy your local Slack token to your clipboard
5. Go to your local app at [http://localhost:8080] and open the developer console
6. Paste the contents of your clipboard and press Enter
7. Your local app should now show you as authenticated

### Using the server functions

You'll need a Slack app with a client id and secret to run the server functions. [Go to your Slack app's page](https://api.slack.com/apps) to get or create your app. Then use the configuration values for that app to setup and run [the authentication lambda functions](./functions). Once you have your client id and secret:

1. Start the local app with `npm start`
1. Put `DEV_CLIENT_ID=YOUR_CLIENT_ID` and `DEV_CLIENT_SECRET=YOUR_CLIENT_SECRET` in `.env`
1. Start the functions server with `npm run functions:start`
1. The app will proxy all the API requests to the locally running functions server
1. Find your development server URL from the output of `npm start` (it should be [http://localhost:8080])
1. Go to your Slack app's "OAuth & Permissions" settings and add your development server as a redirect url. Note that this url will only affect instances of the server running with the `DEV_CLIENT_ID` and `DEV_CLIENT_SECRET`. Any changes to production OAuth redirect URLs need to be reviewed by Slack.

### So you want to test on your mobile device

1. Follow the instructions above from the "Using the server functions" section
1. Make sure to use the local IP address version of the development URL for the redirect url

## Building for Production

This app gets built as static files that can be hosted anywhere. Run the following commands to build a production ready version to the `build/` directory.

```sh
npm run build
```

If you'd like to test the production version locally, you can run the following command which will serve whatever files are in the `build/` directory.

```sh
npx serve -s build
```

## Contributing

Follow the guidelines in the [contribution docs](./docs/CONTRIBUTING.md).

## Credit

Credit to [@latentflip's](https://github.com/latentflip) [gifhu.gs](https://github.com/latentflip/gifhu.gs) from which I took the initial implementation for the getUserMedia -> gif code.

## License

MIT

[face.camp]: https://face.camp
[http://localhost:8080]: http://localhost:8080
