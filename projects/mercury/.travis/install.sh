#!/bin/bash
sudo rm /etc/apt/sources.list.d/couchdb.list
sudo add-apt-repository -y ppa:ubuntu-toolchain-r/test
sudo apt-get update -y
sudo apt-get -y install g++-4.9

