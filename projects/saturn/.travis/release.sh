#!/bin/bash

root="$PWD"

cd "$root/saturn"
$BUILD_SCRIPTS_DIR/docker/release.sh

cd "$root"
