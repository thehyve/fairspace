This directory contains a script to rerun the Workspace Keycloak configuration
job. This is needed if new configuration items have been added to the
Keycloak configuration scripts, and these have to be applied to an existing workspace.

## Prerequisites

- You'll need the Helm values file of the existing workspace.
- You'll need to have kubectl installed locally, and have management access to the
  cluster you want to run the Keycloak configuration job on.
- It is useful, but not strictly necessary, to have the [Fairspace shell shortcuts](https://github.com/fairspace/fr-shortcuts)
  installed.

## Instructions

- Change the current kubectl context to the cluster you want to run the job on. For example:
  `fr context ci`.
- Run the script like this: `./rerun-keycloak-config.sh <namespace> <releasename> <valuesfile>`. For example:
  `./rerun-keycloak-config.sh workspace-ci workspace-ci ../../.travis/ci-values.yaml`
- The last line of the script output contains a fr command that can be used to monitor the progress
  of the job. It may take a couple of minutes for the keycloak configuration job to finish.

## See also

- Please consult the [README of the Keycloak configuration scripts repository](https://github.com/fairspace/keycloak-configuration)
  for additional information about the Keycloak configuration scripts.
