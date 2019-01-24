{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the workspace.
*/}}
{{- define "workspace.name" -}}
{{- .Values.nameOverride | default .Release.Name | default "workspace" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "workspace.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "workspace.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a name for the tls secret for workspace
*/}}
{{- define "workspace.tlsSecretName" -}}
{{- if .Values.workspace.ingress.tls.secretNameOverride -}}
{{- .Values.workspace.ingress.tls.secretNameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- printf "tls-%s" .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "tls-%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}


{{/*
Create the keycloak baseUrl, either by using the override value or constructing it ourselves
*/}}
{{- define "keycloak.baseUrl" -}}

{{- if .Values.hyperspace.locationOverrides.keycloak -}}
{{- .Values.hyperspace.locationOverrides.keycloak -}}
{{- else -}}

{{- if .Values.hyperspace.tls -}}
{{- $scheme := "https" -}}
{{- printf "%s://keycloak.%s" $scheme .Values.hyperspace.domain -}}
{{- else -}}
{{- $scheme := "http" -}}
{{- printf "%s://keycloak.%s" $scheme .Values.hyperspace.domain -}}
{{- end -}}

{{- end -}}
{{- end -}}

{{/*
Define the keycloak realm, by using a set value. This allows us to pass the value to subcharts
*/}}
{{- define "keycloak.realm" -}}
{{- .Values.hyperspace.keycloak.realm -}}
{{- end -}}

{{/*
Scheme to access workspace components (http or https)
*/}}
{{- define "workspace.scheme" -}}
{{- if .Values.workspace.ingress.enabled -}}
{{- if .Values.workspace.ingress.tls.enabled -}}
{{- "https" -}}
{{- else -}}
{{- "http" -}}
{{- end -}}
{{- else -}}
{{- "http" -}}
{{- end -}}
{{- end -}}

{{/* Jupyterhub external hostname */}}
{{- define "jupyterhub.hostname" -}}
{{- printf "jupyterhub.%s" .Values.workspace.ingress.domain -}}
{{- end -}}

{{/* Pluto external hostname */}}
{{- define "pluto.hostname" -}}
{{- .Values.workspace.ingress.domain -}}
{{- end -}}

{{/* Storage external hostname */}}
{{- define "storage.hostname" -}}
{{- printf "storage.%s" .Values.workspace.ingress.domain -}}
{{- end -}}

{{- define "workspace.url" -}}
{{ template "workspace.scheme" . }}://{{ template "pluto.hostname" . }}
{{- end -}}

{{- define "jupyterhub.url" -}}
{{- if .Values.services.jupyterhub -}}
{{- .Values.services.jupyterhub -}}
{{- else -}}
{{ template "workspace.scheme" . }}://{{ template "jupyterhub.hostname" . }}
{{- end -}}
{{- end -}}

{{- define "storage.url" -}}
{{ template "workspace.scheme" . }}://{{ template "storage.hostname" . }}
{{- end -}}

{{- define "neptune.postgres.host" -}}
{{- printf "%s-%s" .Release.Name .Values.postgresql_neptune.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- define "ceres.postgres.host" -}}
{{- printf "%s-%s" .Release.Name .Values.postgresql_neptune.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "callisto.fullname" -}}
{{- .Values.callisto.nameOverride | default (printf "%s-callisto" .Release.Name) -}}
{{- end -}}
{{- define "saturn.fullname" -}}
{{- .Values.saturn.nameOverride | default (printf "%s-saturn" .Release.Name) -}}
{{- end -}}
{{- define "ceres.fullname" -}}
{{- .Values.ceres.nameOverride | default (printf "%s-ceres" .Release.Name) -}}
{{- end -}}
{{- define "mercury.fullname" -}}
{{- .Values.mercury.nameOverride | default (printf "%s-mercury" .Release.Name) -}}
{{- end -}}
{{- define "neptune.fullname" -}}
{{- .Values.neptune.nameOverride | default (printf "%s-neptune" .Release.Name) -}}
{{- end -}}
{{- define "pluto.fullname" -}}
{{- .Values.pluto.nameOverride | default (printf "%s-pluto" .Release.Name) -}}
{{- end -}}
{{- define "titan.fullname" -}}
{{- .Values.titan.nameOverride | default (printf "%s-titan" .Release.Name) -}}
{{- end -}}


{{- define "rabbitmq.pluto.username" -}}
{{- .Values.pluto.rabbitmq.username | default (printf "%s-pluto" .Release.Name) -}}
{{- end -}}
{{- define "rabbitmq.neptune.username" -}}
{{- .Values.neptune.rabbitmq.username | default (printf "%s-neptune" .Release.Name) -}}
{{- end -}}
{{- define "rabbitmq.ceres.username" -}}
{{- .Values.ceres.rabbitmq.username | default (printf "%s-ceres" .Release.Name) -}}
{{- end -}}
{{- define "rabbitmq.titan.username" -}}
{{- .Values.titan.rabbitmq.username | default (printf "%s-titan" .Release.Name) -}}
{{- end -}}
{{- define "rabbitmq.callisto.username" -}}
{{- .Values.callisto.rabbitmq.username | default (printf "%s-callisto" .Release.Name) -}}
{{- end -}}
