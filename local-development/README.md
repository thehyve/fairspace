# Local development
When developing a service, you can run all services on your local machine for testing. This can be done
in several ways:
* Starting all services locally. See below.
* Running the helm chart in minikube
* (Only for mercury) Run against a stubbed backend

## Hyperspace
A workspace is associated with a hyperspace. When running Fairspace locally, the easiest
way to set it up is to use docker-compose. Alternatively, you could install hyperspace
onto minikube to have a more real-life scenario.

### Using docker-compose

You need to be able to download images from the Fairspace docker registry.
Install [the Google Cloud SDK](https://cloud.google.com/sdk/install), ensure
that your Google account has access to the fairspace-207108 GCP project,
log in using `gcloud auth login`, and configure Docker for access to the GCP
registries using `gcloud auth configure-docker`.

Then run `docker-compose up -d` in the current directory to setup and configure
a hyperspace for local development. This will also configure keycloak.

The configuration is as follows:
* Keycloak exposed on port 5100 (credentials: keycloak/keycloak)

Please note that after starting the containers, it may take some time before keycloak is
configured. You can verify this by typing `docker ps` to check whether the `keycloak-config_1`
container is still running. The configuration should be complete after the keycloak-config
container has terminated.

### Installing on minikube
You can install hyperspace on minikube with
the provided `hyperspace.yaml` file. To do so, first ensure that you have
 the latest version of the charts: `helm repo update`

If you have not yet configured the Fairspace helm repository, you first have to run
`helm plugin install https://github.com/nouney/helm-gcs` and
`helm repo add fairspace gs://fairspace-helm`.

Furthermore, ensure that Minikube can access the Docker images in the
container registry. See <https://container-solutions.com/using-google-container-registry-with-kubernetes/>
for more information about how to configure this.

The chart is configured by default to run on a RBAC enabled cluster.

Installing the chart can be done with the following command:

```bash
helm install fairspace/hyperspace -n hyperspace -f hyperspace.yaml [ --set fairspaceImagePullSecret=... ]
```

This will install:
* Keycloak exposed on port 5100

#### Setup a workspace in keycloak
After setting up hyperspace on minikube, keycloak has to be configured.
There are scripts to do so. See `/charts/workspace/templates/config/*` for the settings.

## Starting services locally
You can start all services from your local machine. You can reach the workspace by
going to http://localhost:5000. If you disable authentication (see below), you can also
access mercury directly at http://localhost:3000.

### Pluto
You can run pluto as a spring boot application from you IDE with the following profiles:
* local
* noAuth (optionally, if you want to disable authentication)

### Saturn
You can run Saturn as a Java application from you IDE by running the main class `io.fairspace.saturn.App`

### Mercury
You can run mercury locally using `yarn start`.
