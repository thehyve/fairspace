#!/bin/bash

$BUILD_SCRIPTS_DIR/npm/tag.sh
$BUILD_SCRIPTS_DIR/npm/build.sh
$BUILD_SCRIPTS_DIR/docker/build.sh
