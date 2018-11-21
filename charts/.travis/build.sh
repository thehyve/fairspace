#!/bin/bash
$BUILD_SCRIPTS_DIR/helm/tag.sh
.travis/add_pod_annotations.sh
$BUILD_SCRIPTS_DIR/helm/add_repos.sh
$BUILD_SCRIPTS_DIR/helm/add_pod_annotations.sh
$BUILD_SCRIPTS_DIR/helm/build.sh

if [[ $SHOULD_RELEASE ]]; then
  $BUILD_SCRIPTS_DIR/helm/release.sh
fi
