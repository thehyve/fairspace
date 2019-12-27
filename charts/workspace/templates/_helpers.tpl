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
Create the keycloak baseUrl
*/}}
{{- define "keycloak.baseUrl" -}}
{{- .Values.external.keycloak.baseUrl -}}
{{- end -}}

{{/*
Define the keycloak realm, by using a set value. This allows us to pass the value to subcharts
*/}}
{{- define "keycloak.realm" -}}
{{- .Values.external.keycloak.realm -}}
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


{{/* Pluto external hostname */}}
{{- define "pluto.hostname" -}}
{{- .Values.workspace.ingress.domain -}}
{{- end -}}

{{/* Storage external hostname */}}
{{- define "storage.hostname" -}}
{{- printf "storage.%s" .Values.workspace.ingress.domain -}}
{{- end -}}

{{/* Docs external hostname */}}
{{- define "docs.hostname" -}}
{{- printf "docs.%s" .Values.workspace.ingress.domain -}}
{{- end -}}

{{- define "workspace.url" -}}
{{ template "workspace.scheme" . }}://{{ template "pluto.hostname" . }}
{{- end -}}

{{- define "jupyter.url" -}}
{{ template "workspace.scheme" . }}://jupyter.{{ template "pluto.hostname" . }}
{{- end -}}

{{- define "storage.url" -}}
{{ template "workspace.scheme" . }}://{{ template "storage.hostname" . }}
{{- end -}}

{{- define "docs.url" -}}
{{ template "workspace.scheme" . }}://{{ template "docs.hostname" . }}
{{- end -}}

{{- define "saturn.fullname" -}}
{{- .Values.saturn.nameOverride | default (printf "%s-saturn" .Release.Name) -}}
{{- end -}}
{{- define "mercury.fullname" -}}
{{- .Values.mercury.nameOverride | default (printf "%s-mercury" .Release.Name) -}}
{{- end -}}
{{- define "pluto.fullname" -}}
{{- .Values.pluto.nameOverride | default (printf "%s-pluto" .Release.Name) -}}
{{- end -}}
{{- define "docs.fullname" -}}
{{- .Values.docs.nameOverride | default (printf "%s-docs" .Release.Name) -}}
{{- end -}}

{{- define "elasticsearch.baseurl" -}}
{{- printf "%s://%s:%s/" .Values.external.elasticsearch.rest.scheme .Values.external.elasticsearch.rest.host (.Values.external.elasticsearch.rest.port | toString) -}}
{{- end -}}


{{- define "elasticsearch.resturl" -}}
{{- printf "%s://%s:%s/%s/_search" .Values.external.elasticsearch.rest.scheme .Values.external.elasticsearch.rest.host (.Values.external.elasticsearch.rest.port | toString) .Values.external.elasticsearch.indexName -}}
{{- end -}}

{{- define "workspace.roles.sparql" -}}
{{ .Values.workspace.keycloak.roles.sparql | default (printf "sparqluser-%s" (include "workspace.name" .)) }}
{{- end -}}

{{- define "workspace.roles.datasteward" -}}
{{ .Values.workspace.keycloak.roles.datasteward | default (printf "datasteward-%s" (include "workspace.name" .)) }}
{{- end -}}

{{- define "workspace.roles.coordinator" -}}
{{ .Values.workspace.keycloak.roles.coordinator | default (printf "coordinator-%s" (include "workspace.name" .)) }}
{{- end -}}

{{- define "workspace.roles.user" -}}
{{ .Values.workspace.keycloak.roles.user | default (printf "user-%s" (include "workspace.name" .)) }}
{{- end -}}

