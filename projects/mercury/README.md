# Mercury

This application contains the user interface to list, manage and 
explore projects in Fairspace.


## Architecture

Some general architecture on the overall code can be found [here](./architecture.md);


## Access requirements

In order creation of new workspaces and role management to work the Keycloak instance used by Mercury should 
contain a properly configured service account which should be able to create rew roles and assign them to users in the Fairspace realm.
The necessary Keycloak credentials should be passed to the back-end using the following environment variables:

|Variable                          |Value used in dev. mode  |
|----------------------------------|-------------------------|
|KEYCLOAK_CLIENT_SECRET            |**********               |
|FAIRSPACE_SERVICE_ACCOUNT_USERNAME|fairspace-service-account|
|FAIRSPACE_SERVICE_ACCOUNT_PASSWORD|keycloak                 |


The service account should be granted the following `realm-management` roles in the Fairspace realm: `view-realm`, `manage-realm`, `manage-authorization`.
That holds for both development and production setups.
In development mode it can be done through the Keycloak admin console running on `localhost:5100`. 

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

Some types have been added using [flow]. To run the flow type checker:
```
yarn flow
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


[flow]: https://flow.org/en/docs/lang/
