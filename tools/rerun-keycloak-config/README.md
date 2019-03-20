This directory contains a script to rerun the Workspace Keycloak configuration
script. This is needed if new configuration items have been added to the
Keycloak configuration scripts, and these need to be applied to an existing workspace.

== Prerequisites

- You'll need the Helm values file of the existing workspace.
- You'll need to have kubectl installed locally, and have management access to the
  cluster you want to run the Keycloak configuration job on.
- It is useful, but not strictly necessary, to have the [Fairspace shell shortcuts](https://github.com/fairspace/fr-shortcuts)
  installed.
- You'll need to install the dependencies of the keycloak configuration job script locally. Either
  use `pip install -r requirements.txt` or run the script in a virtualenv.

== Instructions

- Change the current kubectl context to the cluster you want to run the job on. For example:
  `fr context ci`.
- Run the script like this: `./rerun-keycloak-config.py --workspace-name workspace-ci --release-name workspace-ci --values-file ../../.travis/ci-values.yaml` . Replace the workspace name, release name and location of the values file as needed.
- You can monitor the output of the job using: `fr logs workspace-ci-keycloak-configuration`
  (replace `workspace-ci` with the name of the workspace if you don't run it on CI). It may take a couple of
  minutes for the keycloak configuration job to finish.

== See also

- Please consult the [README of the Keycloak configuration scripts repository](https://github.com/fairspace/keycloak-configuration)
  for additional information about the Keycloak configuration scripts.
