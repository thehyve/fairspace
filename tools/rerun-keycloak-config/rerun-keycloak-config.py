#!/usr/bin/env python3
#
# This script reruns the Keycloak configuration job. It assumes that the configmap
# is already been present through a normal helm install of Workspace. It assumes that
# the keycloak ingress is TLS-enabled.
#

import argparse
from jinja2 import Environment, FileSystemLoader
import subprocess
import yaml

parser = argparse.ArgumentParser()
parser.add_argument("--workspace-name", type=str, required=True, dest="workspaceName",
                    help="the name of the workspace, e.g. workspace-ci")
parser.add_argument("--release-name", type=str, required=True, dest="releaseName",
                    help="the name of the helm release, as shown in the output of helm list")
parser.add_argument("--values-file", type=str, required=True,dest="valuesFile",
                    help="the name of the values file for the environment")
args = vars(parser.parse_args())

print("Reading values file ...")

with open(args['valuesFile'] , 'r') as input:
    try:
        values=yaml.safe_load(input)
    except yaml.YAMLError as exception:
        print("Error while opening values file:")
        print(exception)
        sys.exit(1)

fullName=args['workspaceName']
releaseName=args['releaseName']
keycloakImage=values['workspace']['configurationScripts']['keycloak']['image']
keycloakRealm=values['hyperspace']['keycloak']['realm']
keycloakUsername=values['hyperspace']['keycloak']['username']

if 'locationOverrides' in values['hyperspace'] and 'keycloak' in values['hyperspace']['locationOverrides']:
    keycloakBaseURL=values['hyperspace']['locationOverrides']
else:
    keycloakBaseURL="https://keycloak."+values['hyperspace']['domain']

templateEnv = Environment(loader=FileSystemLoader(searchpath="./"))
template= templateEnv.get_template("keycloak-job-template.yaml")

print("Writing job file ...")
with open("keycloak-job-template.complete.yaml","w") as output:
    try:
        output.write(template.render(locals())+"\n")
    except:
        print("Error: unable to write YAML for job to temporary file.")
        sys.exit(1)

print("Applying job to cluster ...")
subprocess.run(["kubectl","apply","-f","keycloak-job-template.complete.yaml","-n",fullName])

print("Script finished. Use \"fr logs " + releaseName + "-keycloak-configuration\" to monitor progress of keycloak configuration job.")
