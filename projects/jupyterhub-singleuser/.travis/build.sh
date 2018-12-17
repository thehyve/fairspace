#!/bin/bash

echo "${DOCKER_PASSWORD}" | docker login ${DOCKER_REPO} -u "${DOCKER_USERNAME}" --password-stdin
docker build . -f ./images/full/Dockerfile --tag "${CONTAINER_NAME}" --tag "${CONTAINER_NAME}-full"
docker build . -f ./images/simple/Dockerfile --tag "${CONTAINER_NAME}-simple"
