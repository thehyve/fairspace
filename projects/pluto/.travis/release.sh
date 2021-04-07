#!/bin/bash

root="$PWD"

cd "$root/pluto"
$BUILD_SCRIPTS_DIR/docker/release.sh

cd "$root"
