#!/bin/sh
#
# This script adds a user to keycloak
#
# Required arguments to this script are:
#   realm:       Realm to store the user in
#   username:    Username for the user
#   firstname:   Firstname of the user
#   lastname:    Lastname of the user
#   password:    Password for the new user
#
# An authenticated session for keycloak is assumed to be present.

DIR=$(dirname "$0")
REALM=$1
USERNAME=$2
FIRSTNAME=$3
LASTNAME=$4
PASSWORD=$5

sed \
    -e "s/\${USERNAME}/$USERNAME/g" \
    -e "s/\${FIRSTNAME}/$FIRSTNAME/g" \
    -e "s/\${LASTNAME}/$LASTNAME/g" \
    ${DIR}/user.json | \
    kcadm.sh create users -r "$REALM" -f -

kcadm.sh set-password -r "$REALM" --username "$USERNAME" --new-password "$PASSWORD"
