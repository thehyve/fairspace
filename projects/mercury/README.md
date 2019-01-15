# Mercury
This application contains a portal UI for within a workspace. The UI is based on [Material UI](https://material-ui.com/).

### Running the app in development mode
The app needs a backend to communicate with. For convenience, there are 2 npm/yarn scripts
to use for local development:

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

## App State Structure
Below you can find the structure of the state that is in the store. It is
shown here for future reference and easy lookup.
```javascript
{
    cache: {
        collections: {
            pending: false,
            error: false,
            items: {
                4: {
                    id: 4,
                    name: 'John Snow\'s collection',
                    description: 'Around the world...',
                    location: 'john_snow_s_collection-4',
                    uri: 'http://workspace.uri/iri/collections/4'
                },
                6: {
                    id: 6,
                    name: 'John Snow\'s collection',
                    description: 'Around the world...',
                    location: 'john_snow_s_collection-6',
                    uri: 'http://workspace.uri/iri/collections/6'
                }
            }
        },
        files: {
            4: {
                '/': {
                    pending: false,
                    error: false,
                    items: [
                        {
                            name: 'file.txt',
                            size: 292
                        },
                        {
                            name: 'subdir',
                            type: 'dir'
                        }
                    ]
                },
                '/subdir': {
                    pending: true,
                    error: false,
                    items: []
                }
            }
        }
    }
    collections: {
        selectedCollectionId: 4,
        selectedPaths: '/subdirectory/file.txt',

        openedCollectionId: 4,
        openedPath: '/subdirectory',
    },
    account: {
        user: {
            pending: false,
            error: false,
            item: {
                id: 'a2ecd794-faa8-44ef-8fae-d70af8f437ee',
                name: 'Ygritte'
            }
        }
        authorizations: {
            pending: false,
            error: false,
            items: [
                'user-workspace-ci',
                'admin-workspace-ci',
                'uma-authorization'
            ]
        }
    },
    ui: {
        informationPanelOpened: true
    }
}
 */
```
