#!/bin/bash

# Install
sudo rm /etc/apt/sources.list.d/couchdb.list || exit 1
sudo add-apt-repository -y ppa:ubuntu-toolchain-r/test || exit 1
sudo apt-get update -y || exit 1
sudo apt-get -y install g++-4.9 || exit 1

# Actual build
$BUILD_SCRIPTS_DIR/yarn/tag.sh || exit 1
$BUILD_SCRIPTS_DIR/yarn/build.sh || exit 1
$BUILD_SCRIPTS_DIR/docker/build.sh
