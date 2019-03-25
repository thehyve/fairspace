#!/bin/sh
#
# Script for rerunning the Keycloak configuration job in helm.
# Parameters:
# 1. Namespace
# 2. Release name of the Workspace
# 3. Values file of the Workspace

set -e
set -u

namespace=$1
if [ -z "$namespace" ]
then echo "Error: no namespace argument provided."
     exit 1
fi

releasename=$2
if [ -z "$releasename" ]
then echo "Error: no release name argument provided."
     exit 1
fi

valuesfile=$3
if [ -z "$valuesfile" ]
then echo "Error: no values file argument provided."
     exit 1
fi
if [ ! -f "$valuesfile" ]
then echo "Error: values file \"${valuesfile}\" not found."
     exit 1
fi

chartname="$(echo "keycloak-manconf-${releasename}" | cut -c 1-63)"

echo "Dynamically creating temporary helm chart $chartname for configuration job ..."
mkdir -p "${chartname}/templates" "${chartname}/charts"
cp ../../charts/workspace/values.yaml "$chartname"
cp ../../charts/workspace/templates/_helpers.tpl "$chartname/templates"

# Need to remove the hook, because otherwise helm will be unable to deploy
# the job by itself, since helm considers jobs with hooks to be unmanaged.
# See https://github.com/helm/helm/issues/4670 for additional information.
grep -v "helm.sh/hook" ../../charts/workspace/templates/config/configure-keycloak-job.yaml \
   | grep -v "^annotations:" \
   | sed "s/{{\.Release\.Name}}\-keycloak\-config\-map/$releasename-keycloak-config-map/" \
   | sed "s/name: \"{{ template \"workspace\.fullname\" \. }}\-/name: \"$releasename-/" \
   | sed "s/name: \"{{ \.Release\.Name }}\-/name: \"$releasename-/" \
   > "$chartname/templates/configure-keycloak-job.yaml"

cat > "$chartname/Chart.yaml" << EOF
apiVersion: v1
appVersion: "1.0"
description: Dynamically created chart for manually running the workspace Keycloak configuration job
name: $chartname
version: 0.1
EOF

echo "Checking whether we first need to remove old manual config helm chart ..."
if   helm list -q | grep -q "^${chartname}$"
then echo "Removing old manual config helm chart ..."
     helm delete --purge "$chartname"
else echo "No need to remove old manual config helm chart."
fi

echo "Deploying new version of manual config helm chart ..."
helm upgrade --install "$chartname" "$chartname" --namespace "$namespace" --values "$valuesfile"

echo "Cleaning up temporary helm chart"
rm -rf "$chartname"

echo "Script finished. You can use \"fr logs keycloak-manconf-${releasename}-keycloak-configuration\" to monitor progress of the job."
