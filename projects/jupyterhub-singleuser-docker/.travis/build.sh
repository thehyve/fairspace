#!/bin/bash

docker build ./images/full --tag "${CONTAINER_NAME}" --tag "${CONTAINER_NAME}-full"
docker build ./images/simple --tag "${CONTAINER_NAME}-simple"
