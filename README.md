# Mercury

This application contains a portal UI for within a workspace. The UI is based on 
[material-ui](https://material-ui.com/).

### Running the app
The app needs a backend to communicate with. It is supposed to run on localhost port 5000. For development purposes,
you can use the provided `express.js` server by running `node server/server.js` in a separate tab.

To get the app itself running, enter `yarn start`. This requires you to have [yarn](https://yarnpkg.com/lang/en/) installed.

### Development
If you want to develop locally on this application. You need to change the `retrieveExternalConfig` in `config.json` to
an empty string.

### Pluto
This frontend will be served by [pluto](https://github.com/fairspace/pluto) to avoid any cross-domain issues when talking to the backend.

### React
This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app). See [REACT.md](REACT.md) for more information.

