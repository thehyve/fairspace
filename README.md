# OIDC authentication library
This repository contains a shared library that provides OIDC authentication
in a Spring application. It has 4 different parts:
* `core` contains the shared functionality between the components
* `sso` contains a library that allows OIDC single sign on, with /login and /logout endpoints, session storage and 
  automatically refreshing the token.
* `bearer-auth` contains a filter that will check requests for a valid token in the `Authorization` header
* `zuul` contains a filter that forwards the access token to upstream requests

## Usage