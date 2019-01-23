#!/bin/bash

$BUILD_SCRIPTS_DIR/gradle/tag.sh || exit 1
$BUILD_SCRIPTS_DIR/gradle/build.sh || exit 1
$BUILD_SCRIPTS_DIR/docker/build.sh
