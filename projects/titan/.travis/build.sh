#!/bin/bash

$BUILD_SCRIPTS_DIR/npm/tag.sh || exit 1
$BUILD_SCRIPTS_DIR/npm/build.sh || exit 1
$BUILD_SCRIPTS_DIR/docker/build.sh
