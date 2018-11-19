# A Docker image for Jupyter Hub. Includes OpenID Connect authenticator.

This image enables authentication using OpenID Connect API. Optionally, it allows to store JWT access and refresh tokens in Pluto, retrive a JSESSIONID cookie and pass it to the single user server as an environment variable. 
Implementation of OpenIDCnnectOAuthenticator is similar to GenericOAuthenticator from ouathenticator package.
