#!/bin/bash

helm repo add jupyterhub https://jupyterhub.github.io/helm-chart/
helm repo add chartmuseum https://chartmuseum.jx.test.fairdev.app/
helm repo add fairspace https://fairspace.github.io/help-repo/
helm repo update
