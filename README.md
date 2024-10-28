# Quick MOBA Game

Using [Phaser.js](https://phaser.io/) to bang this out in under 24 hours.

* Use WASD to move
* Left click shoots a fireball
* We use simple and efficient masking to create map boundaries
* Press `\`` (tidle key) to open the console.
  * Commands are not hooked in yet, but performance metrics can be seen

# [PLAY NOW!](https://hypercrowd.github.io/moba/dist/index.html)

## Installation

```bash
git clone https://github.com/hypercrowd/moba.git
cd moba
npm install # or pnpm install or yarn install
```

## Development

### Dependencies

* **[NodeJS](https://nodejs.org/en/learn/getting-started/introduction-to-nodejs)**: The language system
* **[ESLint](https://eslint.org/docs/latest/use/getting-started)**: The linting system
* **[TypeScript](https://www.npmjs.com/package/typescript)**: The typing system
* **[Vite](https://vite.dev/guide/)**: The build system
* **[Vitest](https://vitest.dev/guide/)**: The testing system
* **[Phaser](https://phaser.io/tutorials/getting-started-phaser3)**: The graphics system
* **[SolidJS](https://www.solidjs.com/guides/getting-started)**: The UI system
* **[PeerJS](https://peerjs.com/docs/#start)**: The P2P system
* **[NW.js](https://nwjs.readthedocs.io/en/latest/For%20Users/Getting%20Started/)**: The standalone application container

### Commands

* **`npm run dev`**: Runs the app in the development mode and opens [http://localhost:5173](http://localhost:5173) to view it in the browser.
* **`npm run build`**: Builds the app for production to the `dist` folder. It correctly bundles Solid in production mode and optimizes the build for the best performance.  All content in `public` is copied over to `dist`.  To confirm this works, run `./dist-test.sh`
* **`npm run release`**: This builds the NW.js standalone version of the app.  (For Steam)  _This is still actively under deveopment and can use some help._
