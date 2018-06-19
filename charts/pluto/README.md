# Pluto
Lightweight api gateway with OpenID Connect authentication support.

## Parameters
* PLUTO_OAUTH2_BASEURL: base url for keycloak installation. For example `http://localhost:9080`
* PLUTO_OAUTH2_REALM: realm used for keycloak authentication. Example: `keycloak`
* ZUUL_ROUTES_UI_URL: URI where the frontend can be found. The frontend is proxied on /ui/. The url is being accessed from within kubernetes, and can be internal or external. Example: `http://mercury-ui:8080` or `https://mercury.fairspace.app`