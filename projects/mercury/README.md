# Mercury

This application contains a portal UI for within a workspace. The UI is based on 
[material-ui](https://material-ui.com/).

### Running the app in development mode
The app needs a backend to communicate with. For convenience, there are 2 npm/yarn scripts
to use for local development:

`yarn server` starts the backend server at port 5000. It can be configured in the file `server/server.js`
`yarn dev` starts the server and the app itself (`yarn start`) concurrently.   

This requires you to have [yarn](https://yarnpkg.com/lang/en/) installed. Alternatively, it should also
work with npm (`npm server` and `npm dev`)

### External configuration
This application loads external configuration from the url `/config/config.json`. This file can locally be 
served by the `server/server.js` stub. By default it only contains the url to access the storage on.

### Pluto
This frontend will be served by [pluto](https://github.com/fairspace/pluto) to avoid any cross-domain issues when talking to the backend.

### React
This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app). See [REACT.md](REACT.md) for more information.
