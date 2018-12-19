#!/bin/bash

# Actual build
$BUILD_SCRIPTS_DIR/yarn/tag.sh || exit 1
$BUILD_SCRIPTS_DIR/yarn/build.sh || exit 1
$BUILD_SCRIPTS_DIR/docker/build.sh
