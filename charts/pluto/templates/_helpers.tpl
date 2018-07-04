{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "pluto.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
*/}}
{{- define "pluto.fullname" -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a service name
*/}}
{{- define "pluto.servicename" -}}
{{- if .Values.service.name -}}
{{- .Values.service.name -}}
{{- else -}}
{{ template "pluto.fullname" . -}}
{{- end }}
{{- end -}}


{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "pluto.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Simple template to allow overrides of the oauth credentials in parent charts
*/}}
{{- define "pluto.keycloak.client.secret" -}}
{{- if .Values.overrideTemplates.keycloak.client.secretName -}}
{{ include .Values.overrideTemplates.keycloak.client.secretName }}
{{- else -}}
{{- printf "%s-oauth" (include "pluto.fullname" .) -}}
{{- end -}}
{{- end -}}

{{/*
Simple template to allow overrides of the workspace name in parent charts
*/}}
{{- define "pluto.workspace.name" -}}
{{- if .Values.overrideTemplates.workspace.name -}}
{{- include .Values.overrideTemplates.workspace.name -}}
{{- else -}}
{{- .Values.workspace.name -}}
{{- end -}}
{{- end -}}

{{/*
Simple template to allow overrides of the oauth baseurl in parent charts
*/}}
{{- define "pluto.keycloak.baseUrl" -}}
{{- if .Values.overrideTemplates.keycloak.baseUrl -}}
{{ include .Values.overrideTemplates.keycloak.baseUrl }}
{{- else -}}
{{- .Values.keycloak.baseUrl -}}
{{- end -}}
{{- end -}}

{{/*
Simple template to allow overrides of the oauth realm in parent charts
*/}}
{{- define "pluto.keycloak.realm" -}}
{{- if .Values.overrideTemplates.keycloak.realm -}}
{{ include .Values.overrideTemplates.keycloak.realm }}
{{- else -}}
{{- .Values.keycloak.realm -}}
{{- end -}}
{{- end -}}