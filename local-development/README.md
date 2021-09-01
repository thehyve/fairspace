# Local development

You can run the Fairspace applications (mercury, saturn and pluto) locally for testing.

## Run standalone development versions

To run the applications in development mode, follow the instructions for [Mercury](../mercury/README.md).
Instructions for Keycloak, the backend (saturn) and proxy (pluto) are included there as well.

## Run Fairspace using minikube

The Helm chart for deploying Fairspace on a Kubernetes cluster can be tested locally using minikube.

### Deploy and configure Keycloak

Check the [Fairspace Keycloak local development instructions](https://github.com/thehyve/fairspace-keycloak/blob/local-development/local-development/README.md) on how to use the Keycloak chart
to install and configure Keycloak locally.
You can also follow the instructions in the [section on Kubernetes and Helm](https://docs.fairway.app/#_kubernetes_and_helm)  in the Fairspace documentation.

### Deploy the Fairspace chart

Please check the [deploy.sh](fairspace/deploy.sh) script.
It assumes Helm 3 to be available in `~/bin/helm3/helm` and
Keycloak to be running at http://keycloak.local.

The ingress node will listen to http://fairspace.local, so make sure to
- add `$(minikube ip) fairspace.local` to `/etc/hosts`:
  ```shell
  echo "$(minikube ip) fairspace.local" >> /etc/hosts
  ```
- add `http://fairspace.local/*` to _Valid Redirect URIs_ in Keycloak.

To start Fairpace:
```shell
# Start minikube
minikube start --disk-size=50g  # the default of 10g may be insufficient
minikube addons enable ingress

# Open kubernetes dashboard
minikube dashboard

# Push images to minikube repository and start Fairspace
./fairspace/deploy.sh
```
The script creates the `fairspace-dev` namespace where all other objects are created.

To shutdown Fairspace, use one of the following:
```shell
# Uninstall Fairspace using Helm
helm uninstall fairspace-local -n fairspace-dev
# Delete fairspace-dev namespace
kubectl delete ns fairspace-dev
```
