# Pluto
Lightweight api gateway with OpenID Connect authentication support.

## Steps to install
Create a `config.yaml` file with the following contents:

```yaml
# Reference to the workspace
workspace:
  name: melanoma

# Keycloak configuration for authentication
keycloak:
  baseUrl: http://192.168.99.100:30867
  realm: fairspace
  client:
    secret: c91ab9e1-e166-4bb7-aa74-cf350e768d60

backends:
  mercury: http://mercury
  neptune: http://neptune
```

Now install pluto with the following command:

`helm install fairspace/pluto -f config.yaml`

## Configuration
Use `helm ... -f config.yaml` to override default configuration parameters from `values.yaml`.

#### Authentication parameters
| Parameter  | Description  | Default |
|---|---|---|
| `workspace.name`   | Name of the workspace. Is used for setting default oauth values |  |
| `keycloak.baseUrl` | Base url for the keycloak instance to communicate with. For example: `https://keycloak.hyperspace.fairspace.app` | |
| `keycloak.client.id` | Client id to for oauth communication | `<workspace-name>-pluto` |
| `keycloak.client.secret` | Client secret for oauth communication. | |
| `keycloak.realm` | Realm that is used for authentication | |
| `keycloak.redirectAfterLogoutUrl` | URL to redirect the user to after he logs out from the workspace. | `https://fairspace.com` |
| `keycloak.requiredAuthority` | Role that the user must have if he wants to login to this workspace. | `user-<workspace-name>` |

#### Backend parameters
| Parameter  | Description  | Default |
|---|---|---|
| `backends.mercury` | URL where mercury can be found. It will be proxied on /ui/ | `http://mercury` |
| `backends.neptune` | URL where neptune can be found. | `http://neptune` |
