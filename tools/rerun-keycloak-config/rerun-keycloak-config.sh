#!/bin/sh
#
# Script for rerunning the Keycloak configuration job in helm.
# Parameters:
# 1. Namespace
# 2. Release name of the Workspace
# 3. Values file of the Workspace

usage () {
  echo "Usage:"
  echo "  $0 <namespace> <release-name> <values-file>"
  echo 
  echo "Example:"
  echo "  $0 workspace-ci workspace-ci ../../.travis/ci-values.yaml"
}

set -e

scriptdir=$(dirname "$0")

namespace=$1
if [ -z "$namespace" ]
then echo "Error: no namespace argument provided."
     usage
     exit 1
fi

releasename=$2
if [ -z "$releasename" ]
then echo "Error: no release name argument provided."
     usage
     exit 1
fi

valuesfile=$3
if [ -z "$valuesfile" ]
then echo "Error: no values file argument provided."
     usage
     exit 1
fi
if [ ! -f "$valuesfile" ]
then echo "Error: values file \"${valuesfile}\" not found."
     exit 1
fi

set -u

chartname="$(echo "keycloak-manconf-${releasename}" | cut -c 1-63)"

echo "Dynamically creating temporary helm chart $chartname for configuration job ..."
mkdir -p "${chartname}/templates" "${chartname}/charts"
cp "${scriptdir}/../../charts/workspace/values.yaml" "$chartname"
cp "${scriptdir}/../../charts/workspace/templates/_helpers.tpl" "$chartname/templates"

grep -v "helm.sh/hook" "${scriptdir}/../../charts/workspace/templates/config/configure-keycloak-job.yaml" \
   | grep -v "annotations:" \
   | sed "s/{{\.Release\.Name}}\-keycloak\-config\-map/$releasename-keycloak-config-map/g" \
   | sed "s/name:[[:space:]]\{1,\}\"{{[[:space:]]\{1,\}template[[:space:]]\{1,\}\"workspace\.fullname\"[[:space:]]\{1,\}\.[[:space:]]\{1,\}}}\-/name: \"$releasename-/g" \
   | sed "s/name:[[:space:]]\{1,\}\"{{[[:space:]]\{0,\}\.Release\.Name[[:space:]]\{0,\}}}\-/name: \"$releasename-/g" \
   > "$chartname/templates/configure-keycloak-job.yaml"

cat > "$chartname/Chart.yaml" << EOF
apiVersion: v1
appVersion: "1.0"
description: Dynamically created chart for manually running the workspace Keycloak configuration job
name: $chartname
version: 0.1
EOF

if kubectl get job -n "$namespace" -o name | grep "^job\.batch\/${releasename}\-keycloak\-configuration$"
then echo "Removing old keycloak configuration job resource ..."
     kubectl delete job -n "$namespace" "${releasename}-keycloak-configuration"
else echo "Keycloak configuration job resource does not exist yet, so no need to remove old resource."
fi

echo "Deploying keycloak config job..."
helm install --debug --dry-run "./keycloak-manconf-${releasename}" --name keycloak-manconf \
   --values "$valuesfile" --namespace "$namespace" | \
   awk '/^# Source:.*\/configure\-keycloak\-job\.yaml$/{p=1;next}p' |
   kubectl apply -f - --namespace "$namespace"

echo
echo "Script finished. You can use \"kubectl describe job ${releasename}-keycloak-configuration -n ${namespace}\""
echo "to monitor the startup phase of the job. After the job has started, you can use \"fr logs\" to monitor its progress."
echo "For example: \"fr logs keycloak-manconf-keycloak-configuration-2w9px\". You can retrieve the pod name from the "
echo "events section of the output of the job description command."
