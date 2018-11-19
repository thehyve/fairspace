#!/bin/bash
$BUILD_SCRIPTS_DIR/helm/tag.sh
$BUILD_SCRIPTS_DIR/helm/add_repos.sh
if [[ $ALLOW_SNAPSHOTS ]]; then $BUILD_SCRIPTS_DIR/helm/allow_snapshot_dependencies.sh; fi
$BUILD_SCRIPTS_DIR/helm/build.sh

if [[ $SHOULD_RELEASE ]]; then
  $BUILD_SCRIPTS_DIR/ci/helm/release.sh
fi
