# Game.io

Server/Client realtime multiplayer game using both UPD (WebRTC) for critical low-latency realtime messaging and TCP (WebSockets) for non-critical messaging.

---

## Development Setup

Ensure required Node version `14` using `nvm`.

```
nvm i
```

Install dependencies with `yarn`.

```
yarn
```

To build for `development` environment and enter watch mode, use two terminals.

One terminal is for building the source and detecting changes, the other is for running the server.

> _Keeping the output separate helps track server logs easier._

**Terminal 1** - Build client + server src _(enter watch mode)_ and serve client locally

> _This will produce atrifacts in the `./dist` folder_

```
yarn dev
```

**Terminal 2** - Start Express server with `nodemon` _(reload on changes)_.

> _Uses built files in `./dist`_

```
yarn start
```

---

## Production Setup

Build for production.

```
yarn build:prod
```

Serve for production.

```
yarn serve:prod
```
