# Use keycloak for authentication

* **Status**: accepted

* **Context**: Our application needs a component to handle authentication. This is something very often done in other systems as well and it is not part of our core proposition.

  Within the company there is a lot of experience with Keycloak. Keycloak is an open source component for authentication that integrates well with other authentication providers (e.g. LDAP).
  This flexibility allows us to support different scenarios for different customers.
  
  Keycloak can be setup to support SSO scenarios where our system has SSO with related apps (e.g. cBioPortal or JupyterHub). 
  
  The OpenID Connect protocol (supported by Keycloak) provides a way for our services not to know any passwords. The services will only receive a (time-limited) token, that proves the 
  identity of the user. This adds an additional layer of security in the way that the password is not spread around the system. 

* **Decision**: we will use Keycloak using the OpenID Connect protocol.      

* **Consequences**: our services will not know any passwords provided by the user. This means that any integration with other systems
that need this password may become more complex.
