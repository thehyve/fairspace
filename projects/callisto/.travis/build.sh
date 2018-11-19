#!/bin/bash

$BUILD_SCRIPTS_DIR/gradle/tag.sh
$BUILD_SCRIPTS_DIR/gradle/build.sh
$BUILD_SCRIPTS_DIR/docker/build.sh
