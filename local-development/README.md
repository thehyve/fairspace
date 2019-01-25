# Local development
When developping a service locally, you can run all services on your local machine. This can be done 
in several ways:
* Starting all services locally. See below.
* Running the helm chart in minikube
* (Only for mercury) Run against a stubbed backend

## Hyperspace
A workspace is associated with a hyperspace. When running locally, the easiest
way to set it up is to use docker-compose. Alternatively, you could install hyperspace
onto minikube to have a more real-life scenario.

### Using docker-compose

First log in on the Fairspace Docker registry using `docker login fairspace.azurecr.io`.
The user name is: fairspace. The password is available through Robert or Sietse.

Then run `docker-compose up -d` in the current directory to setup and configure
a hyperspace for local development. This will also configure keycloak.

The configuration is as follows:
* Keycloak exposed on port 5100 (credentials: keycloak/keycloak)
* Rabbitmq exposed on port 5672 (amqp) and 15672 (management) (credentials: guest/guest)

Please note that after starting the containers, it may take some time before keycloak is 
configured. You can verify this by typing `docker ps` and see if the `keycloak-config_1` 
container is still running.

### Installing on minikube
You can install hyperspace on minikube with
the provided `hyperspace.yaml` file. To do so, first ensure that you have
 the latest version of the charts:
 
```bash
az login
az acr helm repo add -n fairspace
helm repo update
```

Furthermore, ensure that minikube can access the docker images on the 
azure container registry. This can be done by either setting the credentials
for the whole cluster or by providing the credentials manually 

* https://wiki.thehyve.nl/display/VRE/Using+the+local+development+environment
* https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/. 
  Provide the secret name to helm with the `fairspaceImagePullSecret` variable. 

The chart is configured by default to run on a RBAC enabled cluster. If you don't have RBAC enabled
set the variable `rabbitmq.rbacEnabled` to `false`. 

Installing the chart can be done with the following command: 

```bash
helm install fairspace/hyperspace -n hyperspace -f hyperspace.yaml [ --set rabbitmq.rbacEnabled=false ] [ --set fairspaceImagePullSecret=... ]
```

This will install:
* Keycloak exposed on port 5100
* Rabbitmq exposed on port 5672 (amqp) and 15672 (management)

#### Setup a workspace in keycloak and rabbitmq
After setting up hyperspace on minikube, keycloak and rabbitmq have to be configured. 
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
You can run ceres as a Java application from you IDE by running the main class `io.fairspace.saturn.App`

### Ceres
You can run ceres as a spring boot application from you IDE with the following profiles:
* local
* noAuth (optionally, if you want to disable authentication)

### Neptune
You can run neptune as a spring boot application from you IDE with the following profiles:
* local
* noAuth (optionally, if you want to disable authentication)

### Titan
You can run titan locally using the `local-config.js` configuration parameters. Run the following command
```bash
PORT=5110 CONFIG_FILE=../local-development/local-config.js npm start
```

### Mercury
You can run mercury locally using `yarn start`.
