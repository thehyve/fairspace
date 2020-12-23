{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the fairspace.
*/}}
{{- define "fairspace.name" -}}
{{- .Values.nameOverride | default .Release.Name | default "fairspace" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "fairspace.fullname" -}}
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
{{- define "fairspace.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a name for the tls secret for fairspace
*/}}
{{- define "fairspace.tlsSecretName" -}}
{{- if .Values.fairspace.ingress.tls.secretNameOverride -}}
{{- .Values.fairspace.ingress.tls.secretNameOverride | trunc 63 | trimSuffix "-" -}}
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
Scheme to access fairspace components (http or https)
*/}}
{{- define "fairspace.scheme" -}}
{{- if .Values.fairspace.ingress.enabled -}}
{{- if .Values.fairspace.ingress.tls.enabled -}}
{{- "https" -}}
{{- else -}}
{{- "http" -}}
{{- end -}}
{{- else -}}
{{- "http" -}}
{{- end -}}
{{- end -}}


{{/* Saturn external hostname */}}
{{- define "saturn.hostname" -}}
{{- .Values.fairspace.ingress.domain -}}
{{- end -}}


{{- define "fairspace.url" -}}
{{ template "fairspace.scheme" . }}://{{ template "saturn.hostname" . }}
{{- end -}}

{{- define "jupyter.url" -}}
{{ template "fairspace.scheme" . }}://jupyter.{{ template "saturn.hostname" . }}
{{- end -}}

{{- define "saturn.fullname" -}}
{{- .Values.saturn.nameOverride | default (printf "%s-saturn" .Release.Name) -}}
{{- end -}}
{{- define "docs.fullname" -}}
{{- .Values.docs.nameOverride | default (printf "%s-docs" .Release.Name) -}}
{{- end -}}

{{- define "elasticsearch.baseurl" -}}
{{- printf "%s://%s:%s" .Values.external.elasticsearch.rest.scheme .Values.external.elasticsearch.rest.host (.Values.external.elasticsearch.rest.port | toString) -}}
{{- end -}}


