This directory contains a script to rerun the Workspace Keycloak configuration
job. This is needed if new configuration items have been added to the
Keycloak configuration scripts, and these have to be applied to an existing workspace.

## Prerequisites

- You'll need the Helm values file of the existing workspace.
- A local clone of the workspace repository.
- You'll need to have kubectl installed locally, and have management access to the
  cluster you want to run the Keycloak configuration job on.
- It is useful, but not strictly necessary, to have the [Fairspace shell shortcuts](https://github.com/fairspace/fr-shortcuts)
  installed.

## Instructions

- Change the current kubectl context to the cluster you want to run the job on. For example:
  `fr context ci`.
- Ensure that the active branch of the local clone of the workspace repository matches the
  environment. For example, use the dev branch for restarting the keycloak job of the CI environment.
  If the active branch does not have the rerun-keycloak-config script you can copy the
  tools/rerun-keycloak-config directory from the dev branch to the local directory containing the active
  branch.
- Run the script like this: `./rerun-keycloak-config.sh <valuesfile> <namespace> <releasename>`. For example:
  `./rerun-keycloak-config.sh ../../.travis/ci-values.yaml workspace-ci workspace-ci`.
  By default, the workspace name is set to the release name. If you want to override it, run
  the script like this: `./rerun-keycloak-config.sh <valuesfile> <namespace> <releasename> <workspacename> <fullworkspacename>`.
  
The default values for `workspace name` and `full workspace name` are defined in the [template helpers](https://github.com/fairspace/workspace/blob/dev/charts/workspace/templates/_helpers.tpl) file.
- The last line of the script output contains instructions about how to monitor the progress
  of the job. It may take a couple of minutes for the keycloak configuration job to finish.

## See also

- Please consult the [README of the Keycloak configuration scripts repository](https://github.com/fairspace/keycloak-configuration)
  for additional information about the Keycloak configuration scripts.
