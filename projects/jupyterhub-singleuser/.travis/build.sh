#!/bin/bash

if [ "$DEPLOY_PLATFORM" != "GCP" ]
then echo "${DOCKER_PASSWORD}" | docker login ${DOCKER_REPO} -u "${DOCKER_USERNAME}" --password-stdin
fi

docker build . -f ./images/full/Dockerfile --tag "${CONTAINER_NAME}" --tag "${CONTAINER_NAME}-full"
docker build . -f ./images/simple/Dockerfile --tag "${CONTAINER_NAME}-simple"
