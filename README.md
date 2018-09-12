# OIDC authentication library
This repository contains a shared library that provides OIDC authentication
in a Spring application. It has 4 different parts:
* `core` contains the shared functionality between the components
* `sso` contains a library that allows OIDC single sign on, with /login and /logout endpoints, session storage and 
  automatically refreshing the token. This library will perform an oAuth2 login with the configured provider
  and store the retrieved tokens in the user session.
* `bearer-auth` contains a filter that will check requests for a valid token in the `Authorization` header.
* `zuul` contains a filter that forwards the access token to upstream requests

## Usage

1. Add dependencies to one or more packages. Assuming your project has a common setup with an API gateway 
   (with Zuul) and upstream resource services.
   
   The packages can be found in the Nexus repository at `https://nexus.jx.test.fairdev.app/repository/maven-releases/`
   
   The API gateway would need SSO and Zuul, and optionally also support for direct authentication via 
   the `Authorization` header.
   
   ```
   compile("io.fairspace:oidc-auth-sso:${oidcAuthVersion}")
   compile("io.fairspace:oidc-auth-bearer-auth:${oidcAuthVersion}")
   compile("io.fairspace:oidc-auth-zuul:${oidcAuthVersion}")
   ```
   
   Upstream resource services would only need to verify the token in the `Authorization` header.

   ```
   compile("io.fairspace:oidc-auth-bearer-auth:${oidcAuthVersion}")
   ```
   
2. Enable the beans configured in the library by adding a ComponentScan for the package
   ```
   @ComponentScan("io.fairspace.oidc_auth")
   ```
   
3. Specify configuration for the library in a bean of type `OidcConfig`. Within Spring boot
   this can be done by using the `@ConfigurationProperties` annotation 
   The following code will create such a bean, and reads the properties from the `application.yaml` file 
   
   ```
   @ConfigurationProperties(prefix = "security.oidc")
   @Configuration
   public class OidcConfiguration extends OidcConfig {}
   ```
    
   The configuration file would have the following properties:   
   ```
   security:
      oidc:
        auth-uri: ${app.oauth2.base-url}/auth/realms/${app.oauth2.realm}/protocol/openid-connect/auth
        token-uri: ${app.oauth2.base-url}/auth/realms/${app.oauth2.realm}/protocol/openid-connect/token
        jwk-key-set-uri: ${app.oauth2.base-url}/auth/realms/${app.oauth2.realm}/protocol/openid-connect/certs
        logout-uri: ${app.oauth2.base-url}/auth/realms/${app.oauth2.realm}/protocol/openid-connect/logout?redirect_uri=%s
        redirect-after-logout-uri: https://fairspace.com
        clientId: web_app
        clientSecret: web_app
        scope: openid
   ```
   
   You can also create your own bean that extends the OidcConfig class.
   
4. Add filters to actually check the authentication. The library provides 3 filters:
   * Applying the `AuthorizedCheckAuthenticationFilter` will only pass if a valid JWT is provided and it
     contains the authority specified in the constructor.
   * Applying the `AuthenticatedCheckAuthenticationFilter` will only pass if a valid JWT is provided.
   * Applying the `AnonymousCheckAuthenticationFilter` will pass regardless of the JWT provided
   
   The order of these filters should be between `Ordered.HIGHEST_PRECEDENCE + 200` and `Ordered.HIGHEST_PRECEDENCE + 300`
   
   The client application should add these filters for the appropriate URLS manually. For example, using spring boot:
   
   ```
   @Bean
   public FilterRegistrationBean<AuthorizedCheckAuthenticationFilter> authorizedCheckAuthenticationFilter() {
       FilterRegistrationBean<AuthorizedCheckAuthenticationFilter> filterRegBean = new FilterRegistrationBean<>();
       filterRegBean.setFilter(new AuthorizedCheckAuthenticationFilter("required-authority"));
       filterRegBean.addUrlPatterns(securityConfig.getUrls().getNeedsAuthorization());
       filterRegBean.setOrder(Ordered.HIGHEST_PRECEDENCE + 203);
       return filterRegBean;
   } 
   ```


 