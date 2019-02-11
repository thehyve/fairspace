#!/bin/bash

set -e

$BUILD_SCRIPTS_DIR/gradle/tag.sh
./gradlew clean build test jacocoTestReport $GRADLE_OPTIONS
$BUILD_SCRIPTS_DIR/docker/build.sh
