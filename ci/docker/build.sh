#!/bin/bash
#
# Required env variables:
#   $CONTAINER_NAME
#
docker build . --tag "${CONTAINER_NAME}"
