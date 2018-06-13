# Mercury

This application contains a portal UI for within a workspace. The UI is based on 
[react-admin](https://marmelab.com/react-admin/) and [material-ui](https://material-ui.com/).

It is configured to
* talk to REST apis provided by [Spring Boot Data Rest](https://spring.io/guides/gs/accessing-data-rest/) 
* authenticate against the backend on /login

### Running the app
To get the app running, enter `yarn start`. This requires you to have [yarn](https://yarnpkg.com/lang/en/) installed

### Pluto
This frontend will be served by [pluto](https://github.com/fairspace/pluto) to avoid any cross-domain issues when talking to the backend.

### React
This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app). See [REACT.md](REACT.md) for more information.

### Example setup

*NB.* Currently the only configured resource points to an example service, which is probably not available. Also, the
authentication parameters are also fixed.  

