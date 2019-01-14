# Pluto
Lightweight api gateway with OpenID Connect authentication support.

This application functions as a proxy between the microservices and the frontend. Authentication is setup
to use OpenID (against Keycloak). The application leverages the [Netflix Zuul](https://github.com/Netflix/zuul/wiki) proxy and
[Spring Security](https://docs.spring.io/spring-security/site/docs/5.0.5.RELEASE/reference/htmlsingle/), which is described as [spring-cloud-security](https://cloud.spring.io/spring-cloud-security/1.2.x/single/spring-cloud-security.html)

## Backends
The application is currently configured to proxy:
* `/api/storage/**` to titan
* `/api/metadata/**` to neptune
* `/**` to mercury

## Additional endpoints
A health endpoint is provided at `/actuator/health`, accessible without authentication.
Also, account information is available at `/account/name` and `/account/authorizations`.

## Structure
The `app` directory contains the actual application. It can be run from the IDE or from the command line
using gradle: `gradle bootRun`.

## Using mavenLocal
If you have created custom artifacts (e.g. for oidc_auth library) that are in your local maven repository,
you can set the env variable `LOCAL_DEVELOPMENT` to 1 to enable mavenLocal in your build. For example:
``` 
LOCAL_DEVELOPMENT=1 gradle clean build
```

## CSRF
CSRF functionality is enabled. A csrf token is returned on each request in the `X-CSRF-TOKEN` header of the response.
For POST, PUT and PATCH requests, that value should be returned in the `X-CSRF-TOKEN` header in the request.

## Ajax requests
Ajax requests should send along the `X-Requested-With` with value `XMLHttpRequest`. This will tell the application
to return a 401 status on failing authentication instead of a 302 redirect to the login form. The frontend should then
handle the authentication failure itself.

## OAuth2 Refresh token
Currently, when an oAuth2 access token expires, it is automatically refreshed, by a workaround implemented
 manually in `WebSecurityConfiguration.java`. Functionality to do this automatically will
be implemented in Spring Security and is currently planned for 5.1. When that version is released,
we can remove our custom code. See also 
https://github.com/spring-projects/spring-security/issues/4371

## Authorization
Pluto requires the OIDC provider (keycloak) to return a specific authority (configurable, defaults to user-workspace)for the 
user to be allowed to use this workspace.
If the user has logged in, but does not have access to the workspace, most requests will return a HTTP status 403. The user will
however be able to access the frontend at `/` and his name at `/account/name`. This allows the frontend to check `/account/authorizations`
to see if the user is allowed to use this workspace, and if not, show a nice errormessage.

## Creating a compatible backend
The backend microservices that are exposed with this gateway, should also be able to handle the OAuth2 tokens. This can 
easily be done using Spring Security

1. Create a spring boot project with [Spring Initializr](https://start.spring.io/) with 
   1. Spring Boot 2
   2. Minimal dependencies: Cloud OAuth2, Security  
2. Add the `@EnableResourceServer` annotation to your application (or configuration)
3. Add the proper [resource server configuration](https://cloud.spring.io/spring-cloud-security/1.2.x/single/spring-cloud-security.html#_oauth2_protected_resource) to your application.yml. For example:
    ```yaml
    security:
      oauth2:
        resource:
          user-info-uri: http://localhost:9080/auth/realms/keycloak/protocol/openid-connect/userinfo
          prefer-token-info: false
          jwk:
            key-set-uri: http://localhost:9080/auth/realms/keycloak/protocol/openid-connect/certs
    ```
