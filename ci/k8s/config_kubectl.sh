#!/bin/bash
#
# The specific kube-config file is stored encrypted
#
mkdir -p $HOME/.kube
openssl aes-256-cbc -K $encrypted_5162cfbd2a53_key -iv $encrypted_5162cfbd2a53_iv -in ci/kube-config.yml.enc -out $HOME/.kube/config -d
