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
{{- if .Values.workspace.ingress.tls.enabled -}}
{{- "https" -}}
{{- else -}}
{{- "http" -}}
{{- end -}}
{{- end -}}


{{/* Mercury external hostname */}}
{{- define "mercury.hostname" -}}
{{- .Values.workspace.ingress.domain -}}
{{- end -}}

{{/* Docs external hostname */}}
{{- define "docs.hostname" -}}
{{- printf "docs.%s" .Values.workspace.ingress.domain -}}
{{- end -}}

{{- define "workspace.url" -}}
{{ template "workspace.scheme" . }}://{{ template "mercury.hostname" . }}
{{- end -}}

{{- define "jupyter.url" -}}
{{ template "workspace.scheme" . }}://jupyter.{{ template "mercury.hostname" . }}
{{- end -}}

{{- define "docs.url" -}}
{{ template "workspace.scheme" . }}://{{ template "docs.hostname" . }}
{{- end -}}

{{- define "mercury.fullname" -}}
{{- .Values.mercury.nameOverride | default (printf "%s-mercury" .Release.Name) -}}
{{- end -}}
{{- define "docs.fullname" -}}
{{- .Values.docs.nameOverride | default (printf "%s-docs" .Release.Name) -}}
{{- end -}}

{{- define "elasticsearch.baseurl" -}}
{{- printf "%s://%s:%s" .Values.external.elasticsearch.rest.scheme .Values.external.elasticsearch.rest.host (.Values.external.elasticsearch.rest.port | toString) -}}
{{- end -}}

{{- define "keycloak.prefix" -}}
{{- printf "%s-%s" .Release.Name "keycloak" | trunc 20 | trimSuffix "-" -}}
{{- end -}}
