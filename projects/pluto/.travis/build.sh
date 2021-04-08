#!/bin/bash
set -e

root="$PWD"

echo 'Building the front-end'
cd "$root"
cd "../mercury"
$BUILD_SCRIPTS_DIR/yarn/tag.sh || exit 1
$BUILD_SCRIPTS_DIR/yarn/build.sh || exit 1

echo 'Building the gateway'
cd "$root"
$BUILD_SCRIPTS_DIR/gradle/tag.sh
./gradlew clean assemble jacocoTestReport $GRADLE_OPTIONS

test -e build/mercury && rm -r build/mercury
cp -r ../mercury/build build/mercury

echo 'Building the pluto image'
$BUILD_SCRIPTS_DIR/docker/build.sh

cd "$root"
