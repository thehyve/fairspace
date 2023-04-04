/* Dependency update of react-scripts resulted in following error:
    BREAKING CHANGE: webpack < 5 used to include polyfills for node.js core modules by default.
    [3] This is no longer the case. Verify if you need this module and configure a polyfill for it.
We fixed it by using the "react-app-rewired" package, and using this custom overrides.
https://github.com/timarney/react-app-rewired
*/
const webpack = require('webpack');

module.exports = function override(config, env) {
    config.resolve.fallback = {
        stream: false,
        crypto: false,
        util: false,
        path: false
    };
    return config;
}

process.env.GENERATE_SOURCEMAP = 'false';
