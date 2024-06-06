#!/usr/bin/env bash

here=$(realpath $(dirname "${0}"))
helm_cmd=$(realpath ~/bin/helm3/helm)

# Prerequisites:
# $ minikube start
# $ minikube addons enable ingress

host_address=$(minikube ssh grep host.minikube.internal /etc/hosts | cut -f1)

eval $(minikube docker-env)

pushd "${here}"

pushd ../../projects/mercury
yarn build || {
  echo "Building mercury failed."
  popd
  popd
  exit 1
}
popd

pushd ../../projects/saturn
(./gradlew clean build -x test && \
  docker build . -t saturn-local:latest) || {
  echo "Building saturn failed."
  popd
  popd
  exit 1
}
popd

pushd ../../projects/pluto
(./gradlew clean assemble && \
  (test ! -e build/mercury || rm -r build/mercury) && \
  cp -r ../mercury/build build/mercury && \
  docker build . -t pluto-local:latest) || {
  echo "Building pluto failed."
  popd
  popd
  exit 1
}
popd

(kubectl get ns fairspace-dev || kubectl create ns fairspace-dev) && \
${helm_cmd} dependency update ../../charts/fairspace && \
${helm_cmd} package ../../charts/fairspace && \
${helm_cmd} upgrade fairspace-local --install --namespace fairspace-dev fairspace-0.0.0-RELEASEVERSION.tgz \
  -f local-values.yaml --set-file svgicons.test=../icons/test.svg

popd
