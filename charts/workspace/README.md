# A Helm chart for VRE workspaces
This helm chart will install and setup a single VRE workspace.

Contains:
- Mercury
- Saturn

A workspace within Fairspace is always associated with a workspace. The
workspace contains shared components, such as Keycloak for authentication.
The connection to the workspace should be configured when installing this chart.

## Prerequisites

Install [the Google Cloud SDK](https://cloud.google.com/sdk/install), ensure
that your Google account has access to the fairspace-207108 GCP project,
log in using `gcloud auth login`, and configure Docker for access to the GCP
registries using `gcloud auth configure-docker`.

## How to install

### On GCP/GKE

First create a configuration file with settings for the workspace to install. For example:

```yaml
workspace:
    domain: workspace.ci.test.fairdev.app
    keycloak:
        username: keycloak
        password: abcdefghi
        realm: workspace
     

```

Then use the procedure at <https://wiki.thehyve.nl/display/VRE/Deploying+Fairspace+on+GCP>
for deploying the application.

### On Minikube

By default, on minikube one would want to run the system without TLS and ingresses. An example
configuration file would be something like:

```yaml
# Provide your own workspace settings here
external:
    keycloak:
        baseUrl: http://192.168.99.100:30867
        username: keycloak
        password: abcdefghi
        realm: workspace

workspace:
    description: "Demo workspace"
    ingress:
        enabled: false
```

We currently don't have a tested script for Minikube deployments. The steps should largely be
the same as the ones for GCP, except for configuration of GCP-specific resources, and cert-manager
installation.

#### Workspace parameters
| Parameter  | Description  | Default |
|---|---|---|
| `nameOverride`  | Unique name for the workspace to install | <release name> |
| `workspace.name`  | Human-friendly name of the workspace | workspace |
| `workspace.description`  | Description of the purpose of the workspace | Workspace |
| `workspace.ingress.domain`   | Domain that is used for setting up the workspace. Is used as postfix for the hostname for the specific components.  | workspace.ci.test.fairdev.app  |
| `workspace.ingress.tls.enabled`  | Whether or not an TLS is enabled on the ingresses for workspace  | true  |
| `workspace.ingress.tls.secretNameOverride`  | If set, this secret name is used for loading certificates for TLS. | `tls-<release name>` |
| `workspace.ingress.tls.certificate.obtain`  | If set, a `Certificate` object will be created, such that [cert-manager](https://cert-manager.readthedocs.io/en/latest/) will request a certificate automatically. | true |
| `workspace.keycloak.roles.user` | Role that the user must have if he wants to login to this workspace. | `user-<workspace-name>` |
| `workspace.keycloak.roles.datasteward` | Role that the user must have if he wants to manage the vocabulary. | `datasteward-<workspace-name>` |
| `workspace.keycloak.groups.user` | Members of this group will show up in the collaborator dropdown. These users normally always have the required authority to login. | `<workspace-name>-users` |

#### External parameters
| Parameter  | Description  | Default |
|---|---|---|
| `external.keycloak.baseUrl` | Base url for keycloak installation  | https://keycloak.ci.fairway.app  |
| `external.keycloak.username`  | Username used for setting up keycloak users. Must have access to the master realm | |
| `external.keycloak.password`  | Password used for setting up keycloak users. | |
| `external.keycloak.realm`  | Keycloak realm that is used for this workspace.| |
| `external.keycloak.clientSecret`  | UUID that is used as client secret in communication between Mercury and keycloak.| <random uuid> |

#### Tool configuration
Configuration settings for specific applications should be put under a corresponding section in config.yaml:

* Mercury
Settings for Mercury should be in the section `mercury`.
See [the Mercury README](https://github.com/fairspace/workspace/blob/dev/projects/mercury/README.md) for more information on the specific settings

## Image pull secrets
When pulling docker images from a private repository, k8s needs credentials to do so. This can be configured using [image pull secrets](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry).
To use the secret for installing a workspace, follow these steps:
- [Create a image pull secret](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/#create-a-secret-in-the-cluster-that-holds-your-authorization-token) with the credentials to login. Please note
  that this secret is bound to a namespace, and as such should be added to each namespace separately.
- Specify the image pull secret as follows for fairspace services:
    ```yaml
      imagePullSecrets:
      - name: <secret-name>
    ```
    This configuration should be added for each fairspace service (mercury, saturn), so for example:
    ```yaml
      mercury:
        imagePullSecrets:
        - name: <secret-name>
    ```

## Upgrading installations
Please note that some values in the chart have a random default. These work fine on first installation, but may break upgrades
of the chart, as the random values may be computed again.

Other properties may contain default values, which is not advised to use. For those reasons it is strongly advised to define
values for at least the following properties:

* `workspace.keycloak.password`
* `workspace.keycloak.clientSecret`
