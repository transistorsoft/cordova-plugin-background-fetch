"use strict";
/**
 * Webpack/Angular browser-target shim for `cordova/exec`.
 *
 * `www/index.js` does `var exec = require('cordova/exec')` so it can be
 * loaded by Cordova's `<js-module>` mechanism, which resolves the bare
 * specifier through `cordova.define`.  Webpack/Angular don't understand
 * `cordova.define` and fail the build trying to look `cordova/exec` up
 * in `node_modules`.
 *
 * The `browser` field in `package.json` redirects that lookup to this
 * file at bundle time.  At runtime — which is always inside a Cordova
 * app — we delegate to `window.cordova.exec`, the real implementation
 * registered by `cordova.js`.
 *
 * This file is NOT registered in `plugin.xml`.  Pure-Cordova builds
 * (no webpack) never see it; they continue to resolve `cordova/exec`
 * through Cordova's own loader.
 */
module.exports = function exec() {
    return window.cordova.exec.apply(window.cordova, arguments);
};
