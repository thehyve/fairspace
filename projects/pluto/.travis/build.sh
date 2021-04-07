#!/bin/bash
set -e

root="$PWD"

echo 'Building the gateway'
cd "$root/pluto"
$BUILD_SCRIPTS_DIR/gradle/tag.sh
./gradlew clean assemble jacocoTestReport $GRADLE_OPTIONS

echo 'Building the pluto image'
$BUILD_SCRIPTS_DIR/docker/build.sh

cd "$root"
