# Mercury

This application contains the user interface to list, manage and 
explore projects in Fairspace.


## Architecture

Some general architecture on the overall code can be found [here](./architecture.md);


## Running the app in development mode

Prerequisites:

- [nodejs and npm](https://www.npmjs.com/get-npm)
- [yarn](https://yarnpkg.com/lang/en/)
- nodemon (can be installed with `npm install -g nodemon`)

The app needs a backend to communicate with. For convenience, there are a few scripts to use for local development:

- `./start-elasticsearch` starts an ElasticSearch instance at port 9200 and 9300.
- `yarn server` starts a proxy server that also serves the frontend at port 8081.
- `yarn start` starts the frontend and exposes it at port 3000

An additional command is available to start all components needed for local development at once:  
```
yarn dev
``` 

This will start:
- Keycloak
- ElasticSearch
- Saturn (JDK 12 required)
- Proxy server
- Frontend
- Unit tests (yarn test)

The application will be available at http://localhost:8081/

It's also possible to start the application without either the proxy server or Saturn and then start the missing component manually in debug mode:

`yarn dev-no-server`

`yarn dev-no-saturn`


## Development

The UI is based on [Material UI](https://material-ui.com/).

### Linting

The project has extended the eslint configuration by React. At the moment it is not enforced and therefore it is recommended to use a plugin for eslint in your favorite IDE. The rules can be found and therefore modified in the .eslintrc.json file.

You can also run eslint manually by doing:  
```
yarn lint
```

### Testing

To run the test scripts:  
```
yarn test
```

Jest is the main testing framework and runner. Some (older) tests use [Enzyme](https://airbnb.io/enzyme/) as the main testing utility. However, there is a newer and simpler utility that is encouraged to be used now, it is [React Testing Library](https://github.com/testing-library/react-testing-library) 


### Search

In order for the search functionality to work, Docker has to be installed and running on your machine.
If you are having an issue running the search, try to stop the container running the Elasticsearch image (`docker ps` to see running containers and docker stop `<CONTAINER_ID>`) and rerun the app again.
