# facecamp-auth

## Setup

```sh
npm install
npm start
```

## Local Dev

1.  Start app server from [facecamp repo](https://github.com/andyet/face.camp)
2.  Open the app at [localhost:8080](https://localhost:8080)

### `clientId` and `clientSecret`

To set these create a `.env` file:

```sh
echo "CLIENT_ID=\nCLIENT_SECRET=" > .env
```

This file will be ignored from git so its safe to put your `CLIENT_ID` and `CLIENT_SECRET` in here.

You can get these by creating [a Slack app](https://api.slack.com/apps).

### `authHost` and `appUrl`

By default `config/development.json` has `authHost` and `appUrl` set for local development.

If you are testing on a device on your network, you'll need to use the url that is displayed in the app's startup message (eg `On Your Network: https://192.168.1.89:8080`) instead of `localhost` and set those in `config/development.json`. Note that `authHost` is `http` while `appUrl` is `https`. This is because `https` is required to get the user's webcam in the app, but not when running this auth server locally.

```json
{
  "authHost": "http://192.168.1.89:3000",
  "appUrl": "https://192.168.1.89:8080"
}
```

_You will also need to whitelist your local IP address in your [Slack app's settings](https://api.slack.com/apps)._
