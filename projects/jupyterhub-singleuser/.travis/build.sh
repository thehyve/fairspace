#!/bin/bash

echo "${DOCKER_PASSWORD}" | docker login ${DOCKER_REPO} -u "${DOCKER_USERNAME}" --password-stdin
docker build ./images/full --tag "${CONTAINER_NAME}" --tag "${CONTAINER_NAME}-full"
docker build ./images/simple --tag "${CONTAINER_NAME}-simple"
