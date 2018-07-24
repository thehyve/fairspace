# Ceres - RDF and SPARQL over HTTP



## Steps to install
Create a `config.yaml` file with the following contents:

```yaml
ceres:
  auth:
    enabled: true
    jwt:
      issuer: http://192.168.99.100:32639
      realm: fairspace
persistence:
  size: 8Gi
```

Now install Ceres with the following command:

`helm install fairspace/ceres -f config.yaml`


If the `secretNamePostfix` is set, the template `<release-name>-<secretNamePostfix>` will be used. In this case
it would be `<release-name-oauth-client>`.

## Configuration
Use `helm ... -f config.yaml` to override default configuration parameters from `values.yaml`.

#### Generic parameters
| Parameter  | Description  | Default |
|---|---|---|
| `service.name` | Name of the service that will be created. | `<release-name>-ceres` |
| `service.type` | Kubernetes service type that is used. | ClusterIP |
| `persistence.size` | Size of the persistent volume. | `8Gi` |

#### Authentication parameters
| Parameter  | Description  | Default |
|---|---|---|
| `ceres.auth.enabled` | Enables authentication | `true` |
| `ceres.auth.jwt.issuer` | Base url for the JWT issuer instance to communicate with, including the base path. For example: `https://keycloak.hyperspace.fairspace.app/auth/realms/ci` | |
| `ceres.auth.jwt.realm` | Realm that is used for authentication | |
