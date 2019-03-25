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

cat > "$chartname/Chart.yaml" << EOF
apiVersion: v1
appVersion: "1.0"
description: Dynamically created chart for manually running the workspace Keycloak configuration job
name: $chartname
version: 0.1
EOF

echo "Deploying keycloak config job..."
helm install --debug --dry-run "./keycloak-manconf-${releasename}" --name keycloak-manconf \
   --values "$valuesfile" --namespace "$namespace" | \
   awk '/^# Source:.*\/configure\-keycloak\-job\.yaml$/{p=1;next}p' |
   kubectl apply -f - --namespace "$namespace"

echo "Script finished. You can use \"fr logs keycloak-manconf-${releasename}-keycloak-configuration\" to monitor progress of the job."
