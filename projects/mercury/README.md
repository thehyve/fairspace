# Mercury
This application contains a portal UI for within a workspace. The UI is based on [Material UI](https://material-ui.com/).

### Running the app in development mode
The app needs a backend to communicate with. For convenience, there are 2 npm/yarn scripts to use for local development:

`yarn server` starts the backend server at port 5000. It can be configured in the file `server/server.js`
`yarn dev` starts the server and the app itself (`yarn start`) concurrently. To open the app point to http://localhost:3000/

This requires you to have [yarn](https://yarnpkg.com/lang/en/) installed. Alternatively, it should also
work with npm (`npm server` and `npm dev`)

### External configuration
This application loads external configuration from the url `/config/config.json`. This file can locally be 
served by the `server/server.js` stub. By default it only contains the url to access the storage on.

### Pluto
This frontend will be served by [pluto](https://github.com/fairspace/pluto) to avoid any cross-domain issues when talking to the backend.

### React
This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app). See [REACT.md](REACT.md) for more information.

### Linting
The project has extended the eslint configuration by React. At the moment it is not enforced and therefore it is recommended to use a plugin for eslint in your favorite IDE. The rules can be found and therefore modified in the .eslintrc.json file.

You can also run eslint manually by doing:
```
.\node_modules\.bin\eslint <DIRECTORY/FILE LOCATION>
```

### Search
In order for the search functionality to work, docker has to be installed and running on your machine. If you are having an issue running the search, try to stop the container running the Elasticsearch image (docker ps to see running containers and docker stop <CONTAINER_ID>) and rerun the app again.

Please note that the data in ElasticSearch is not persistent. This means that every time you restart ElasticSearch, all data will be lost, and no results will be found. Only newly created entities will be visible in search
