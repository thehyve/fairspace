/* Dependency update of react-scripts resulted in following error:
    BREAKING CHANGE: webpack < 5 used to include polyfills for node.js core modules by default.
    [3] This is no longer the case. Verify if you need this module and configure a polyfill for it.
We fixed it by using the "react-app-rewired" package, and using this custom overrides.
https://github.com/timarney/react-app-rewired

... one year later...
We want to configure auto-formatting for JS. Auto-formatting should be aligned with ESlint rules.
Turned out that the custom ESlint rules are not being used and most of them are even broken.
To fix it we fixed the violations first and then, turned out that the custom ESlint config cannot be used
without calling it explicitly what causes 2 linter's check: one from default by react-app-rewired and the custom one.
For a reason, the cusstom ESlint config does not work with react-app-rewired, moreover react-app-rewired is no longer maintained.
To fix that we have to switch to its successor - Craco - https://craco.js.org/

*/

module.exports = {
    webpack: {
        configure: (webpackConfig, { env, paths }) => {
            webpackConfig.resolve.fallback = {
                stream: false,
                crypto: false,
                util: false,
                path: false
            };
            return webpackConfig;
        }
    },
    eslint: {
        mode: 'file',
    }
};

process.env.GENERATE_SOURCEMAP = 'false';
