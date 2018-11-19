#!/bin/bash

# Install
sudo rm /etc/apt/sources.list.d/couchdb.list
sudo add-apt-repository -y ppa:ubuntu-toolchain-r/test
sudo apt-get update -y
sudo apt-get -y install g++-4.9

# Actual build
$BUILD_SCRIPTS_DIR/yarn/tag.sh
$BUILD_SCRIPTS_DIR/yarn/build.sh
$BUILD_SCRIPTS_DIR/docker/build.sh
