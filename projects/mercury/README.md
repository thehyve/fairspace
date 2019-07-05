# Mercury
This application contains a portal UI for within a workspace. The UI is based on [Material UI](https://material-ui.com/).

### Running the app in development mode
The app needs a backend to communicate with. For convenience, there are a few scripts to use for local development:

- `./start-elasticsearch` starts an ElasticSearch instance at port 9200 and 9300.
- `yarn server:mock` starts a mock backend server at port 5000. It can be configured in the file `mock-server/server.js`
- `yarn start` starts the frontend and exposes it at port 3000

An additional command is available to start all components needed for local development at once: 

    `yarn dev` 

This will start:
- ElasticSearch
- Saturn (JDK 11 required)
- Mock server
- Frontend
- Unit tests (yarn test)

To open the app point to http://localhost:3000/

All commands require you to have [yarn](https://yarnpkg.com/lang/en/) installed. 

If there is no vocabulary in present in the workspace, you might have ran saturn prior to starting ES before. Stop the services, remove `../saturn/data/` and restart. The vocabulary should then be visible in the workspace.

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
