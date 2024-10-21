# Quick MOBA Game

Using [Phaser.js](https://phaser.io/) to bang this out in under 24 hours.

* Use WASD to move
* Left click shoots a fireball
* We use simple and efficient masking to create map boundaries

# [PLAY NOW!](https://hypercrowd.github.io/moba/dist/index.html)

## Installation

```bash
git clone https://github.com/hypercrowd/moba.git
cd moba
npm install # or pnpm install or yarn install
```

## Development

* **`npm run dev`**: Runs the app in the development mode and opens [http://localhost:5173](http://localhost:5173) to view it in the browser.
* **`npm run build`**: Builds the app for production to the `dist` folder. It correctly bundles Solid in production mode and optimizes the build for the best performance.  All content in `public` is copied over to `dist`.  To confirm this works, run `./dist-test.sh`
* **`npm run release`**: This builds the NW.js standalone version of the app.  (For Steam)  _This is still actively under deveopment and can use some help._
