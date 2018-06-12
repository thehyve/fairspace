# Pluto
Lightweight api gateway with OpenID Connect authentication support.

This application functions as a proxy between the microservices and the frontend. Authentication is setup
to use OpenID (against Keycloak). The application leverages the [Netflix Zuul](https://github.com/Netflix/zuul/wiki) proxy and
[Spring Security](https://docs.spring.io/spring-security/site/docs/5.0.5.RELEASE/reference/htmlsingle/), which is described as [spring-cloud-security](https://cloud.spring.io/spring-cloud-security/1.2.x/single/spring-cloud-security.html)

## Structure
The `app` directory contains the actual application. It can be run from the IDE or from the command line
using gradle: `gradle bootRun`.

## CSRF
CSRF functionality is enabled. A csrf token is returned on each request in the `X-CSRF-TOKEN` header of the response.
For POST, PUT and PATCH requests, that value should be returned in the `X-CSRF-TOKEN` header in the request.

## OAuth2 Refresh token
Currently, when an oAuth2 access token expires, it is not automatically refreshed. Functionality to do so, will
be implemented in Spring Security and is currently planned for 5.1. In the meantime, we should 
use longer-lived access-tokens and handle refreshes in the frontend. See also 
https://github.com/spring-projects/spring-security/issues/4371

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
