# Game.io

Server/Client realtime multiplayer game using both UPD (WebRTC) for critical low-latency realtime messaging and TCP (WebSockets) for non-critical messaging.

## Development Setup

First, install dependencies:

```
yarn
```

To build for `development` environment and enter watch mode, use two terminals.

**Terminal 1** - Build client and server src, enter watch mode:

_(This will produce atrifacts in the `./dist` folder)_

```
yarn dev
```

**Terminal 2** - Start _(using built files in `./dist`)_ Express server with `nodemon` to reload on changes:

```
yarn start
```

## Production Setup

Build for production:

```
yarn build
```

Serve for production:

```
yarn serve
```
