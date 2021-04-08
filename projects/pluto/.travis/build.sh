#!/bin/bash
set -e

echo 'Building the gateway'
$BUILD_SCRIPTS_DIR/gradle/tag.sh
./gradlew clean assemble jacocoTestReport $GRADLE_OPTIONS

echo 'Building the pluto image'
$BUILD_SCRIPTS_DIR/docker/build.sh
