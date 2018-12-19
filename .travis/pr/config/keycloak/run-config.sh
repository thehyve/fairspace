#!/bin/sh
set -e

PATH=$PATH:/opt/jboss/keycloak/bin
SERVER=http://localhost:8080/auth
REALM=e2e
DIR=$(dirname "$0")

echo "Configuring e2e test users"

# Wait for the server to be online. This may take a while, as the webserver waits for postgres
# If the server will not be up after 5 minutes, the script will die and helm will start a new container
$DIR/wait-for-server-to-respond.sh "$SERVER"

# Login
kcadm.sh config credentials --realm master --server "$SERVER" --user "e2e" --password "e2e"

# Add 2 testusers
$DIR/create-user.sh $REALM test1 First User e2e
$DIR/create-user.sh $REALM test2 Test User e2e

# Determine group ID and user ids
GROUP_ID=$(kcadm.sh get groups -r "$REALM" -q search="e2e-users" --fields id --format csv --noquotes)
USER1_ID=$(kcadm.sh get users -r "$REALM" -q username="test1" --fields id --format csv --noquotes)
USER2_ID=$(kcadm.sh get users -r "$REALM" -q username="test2" --fields id --format csv --noquotes)

# Add 2 testusers to group
kcadm.sh update users/$USER1_ID/groups/$GROUP_ID -r "$REALM" -s realm=$REALM -s userId=$USER1_ID -s groupId=$GROUP_ID -n
kcadm.sh update users/$USER2_ID/groups/$GROUP_ID -r "$REALM" -s realm=$REALM -s userId=$USER2_ID -s groupId=$GROUP_ID -n

echo "Users configured"
