# Mercury

This application contains the user interface to list, manage and 
explore collections and metadata in Fairspace.

For a detailed description of the application, see the [Fairspace documentation](../../README.adoc).

## Development

When starting development in Mercury,
please read about the [project structure](Structure.md) first.


### Running the app in development mode

Prerequisites:

- [nodejs and npm](https://www.npmjs.com/get-npm)
- [yarn](https://yarnpkg.com/lang/en/)

The app needs a backend to communicate with. For convenience, there are a few scripts to use for local development:

- `yarn keycloak` starts Keycloak at port `5100`.
- `yarn saturn` starts a proxy server that also serves the frontend at port `8080`.
- `yarn start` starts the frontend and exposes it at port `3000`.

To start all these components at once, run:  
```bash
yarn dev
``` 

This will start:
- Keycloak
- Saturn (JDK 15 required)
- a [backend proxy](src/setupProxy.js) 
- Frontend

The backend and frontend application will be available at http://localhost:8080/

A reloading version of the frontend application is available at http://localhost:3000.
Sometimes it is needed to navigate to http://localhost:3000/dev to login due to an issue in the backend proxy. 

### Libraries

- The UI uses many components from [Material UI](https://material-ui.com/).
- [axios](https://github.com/axios/axios) is used for http requests.
- [webdav](https://github.com/perry-mitchell/webdav-client) is used for connecting to WebDAV servers.
- [jsonld](https://github.com/digitalbazaar/jsonld.js) is used for unpacking JSON-LD responses.
- :warning: The (deprecated) [elasticsearch](https://www.npmjs.com/package/elasticsearch) package is still being used, but will be removed when all features that use Elasticsearch have been removed.

### Testing

The project has extended the eslint configuration by React. At the moment it is not enforced and therefore it is recommended to use a plugin for eslint in your favorite IDE. The rules are in the .eslintrc.json file.

You can also run eslint manually by doing:  
```bash
yarn lint
```

Some types have been added using [flow]. To run the flow type checker:
```bash
yarn flow
```

[Jest] is the main testing framework and runner for unit tests.
It is encouraged to use the [React Testing Library] for testing React components.
However, some tests still use [Enzyme].

To run the test scripts:  
```bash
yarn test
```


[flow]: https://flow.org/en/docs/lang/
[Jest]: https://jestjs.io/docs/en/getting-started
[Enzyme]: https://airbnb.io/enzyme/
[React Testing Library]: https://github.com/testing-library/react-testing-library
