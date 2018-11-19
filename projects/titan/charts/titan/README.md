# Titan - Servers files over HTTP



## Steps to install
Create a `config.yaml` file with the following contents:

```yaml
persistence:
  size: 8Gi
  subPath: /
```

Now install Titan with the following command:

`helm install fairspace/titan -f config.yaml`


If the `secretNamePostfix` is set, the template `<release-name>-<secretNamePostfix>` will be used. In this case
it would be `<release-name-oauth-client>`.

## Configuration
Use `helm ... -f config.yaml` to override default configuration parameters from `values.yaml`.

#### Generic parameters
| Parameter  | Description  | Default |
|---|---|---|
| `service.name` | Name of the service that will be created. | `<release-name>-titan` |
| `service.type` | Kubernetes service type that is used. | ClusterIP |
| `persistence.size` | Size of the persistent volume. | `8Gi` |
| `persistence.subPath` | A sub-path inside the referenced volume. | `titan` |

