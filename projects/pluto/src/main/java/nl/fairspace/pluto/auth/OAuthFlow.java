package nl.fairspace.pluto.auth;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Map;

import com.nimbusds.oauth2.sdk.*;
import com.nimbusds.oauth2.sdk.auth.ClientAuthentication;
import com.nimbusds.oauth2.sdk.auth.ClientSecretBasic;
import com.nimbusds.oauth2.sdk.auth.ClientSecretPost;
import com.nimbusds.oauth2.sdk.auth.Secret;
import com.nimbusds.oauth2.sdk.id.ClientID;
import com.nimbusds.oauth2.sdk.id.State;
import com.nimbusds.oauth2.sdk.token.AccessToken;
import com.nimbusds.oauth2.sdk.token.RefreshToken;
import com.nimbusds.openid.connect.sdk.OIDCScopeValue;
import com.nimbusds.openid.connect.sdk.OIDCTokenResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import nl.fairspace.pluto.auth.config.OidcConfig;
import nl.fairspace.pluto.auth.model.OAuthAuthenticationToken;

@Component
@Slf4j
public class OAuthFlow {
    final OidcConfig configuration;

    final JwtTokenValidator accessTokenValidator;

    public OAuthFlow(OidcConfig configuration, JwtTokenValidator accessTokenValidator) {
        this.configuration = configuration;
        this.accessTokenValidator = accessTokenValidator;
    }

    public URI getLoginUri(ServerHttpRequest request, State state) throws URISyntaxException {
        // The client callback URI, typically pre-registered with the server
        URI callback = getAuthorizeUri(request);

        // Build the request
        return new AuthorizationRequest.Builder(
                        new ResponseType(ResponseType.Value.CODE), new ClientID(configuration.getClientId()))
                .scope(new Scope(configuration.getScope()))
                .state(state)
                .redirectionURI(callback)
                .endpointURI(configuration.getAuthUrl())
                .build()
                .toURI();
    }

    public OAuthAuthenticationToken retrieveToken(String code, ServerHttpRequest request)
            throws IOException, ParseException, URISyntaxException {
        return retrieveToken(
                new AuthorizationCodeGrant(new AuthorizationCode(code), getAuthorizeUri(request)),
                getClientAuthentication());
    }

    public OAuthAuthenticationToken retrieveTokenBasicAuth(String username, String password)
            throws IOException, ParseException {
        return retrieveToken(
                new ResourceOwnerPasswordCredentialsGrant(username, new Secret(password)),
                getClientAuthenticationPost());
    }

    private OAuthAuthenticationToken retrieveToken(
            AuthorizationGrant authorizationGrant, ClientAuthentication clientAuthentication)
            throws IOException, ParseException {
        // Make the token request
        Scope scope = new Scope(OIDCScopeValue.OPENID, OIDCScopeValue.EMAIL, OIDCScopeValue.PROFILE);
        TokenRequest request =
                new TokenRequest(configuration.getTokenUrl(), clientAuthentication, authorizationGrant, scope);
        OIDCTokenResponse response =
                OIDCTokenResponse.parse(request.toHTTPRequest().send());

        // On failure, tell the user
        if (!response.indicatesSuccess()) {
            // We got an error response...
            ErrorObject errorObject = response.toErrorResponse().getErrorObject();
            log.error(
                    "Unsuccessful response (code {}, http status {}) from authorization grant request: {}",
                    errorObject.getCode(),
                    errorObject.getHTTPStatusCode(),
                    errorObject.getDescription());
            return null;
        }

        // Parse the response
        OIDCTokenResponse successResponse = response.toSuccessResponse();
        AccessToken accessToken = successResponse.getTokens().getAccessToken();
        RefreshToken refreshToken = successResponse.getTokens().getRefreshToken();
        String idTokenString = successResponse.getOIDCTokens().getIDTokenString();

        // Retrieve JWT claimsset
        Map<String, Object> claims = accessTokenValidator.parseAndValidate(accessToken.getValue());

        if (claims == null) {
            log.warn("Access token provided by the token endpoint is invalid");
            log.debug("Access token {}", accessToken.getValue());
            return null;
        }

        // Store the access token, refresh token and id token
        return new OAuthAuthenticationToken(accessToken.getValue(), refreshToken.getValue(), idTokenString, claims);
    }

    public OAuthAuthenticationToken refreshToken(OAuthAuthenticationToken token) throws IOException, ParseException {
        // Construct the grant from the saved refresh token
        RefreshToken refreshToken = new RefreshToken(token.getRefreshToken());
        AuthorizationGrant refreshTokenGrant = new RefreshTokenGrant(refreshToken);

        // Make the token request
        TokenRequest request =
                new TokenRequest(configuration.getTokenUrl(), getClientAuthentication(), refreshTokenGrant);
        OIDCTokenResponse response =
                OIDCTokenResponse.parse(request.toHTTPRequest().send());

        if (response.indicatesSuccess()) {
            OIDCTokenResponse successResponse = response.toSuccessResponse();

            return new OAuthAuthenticationToken(
                    successResponse.getTokens().getAccessToken().getValue(),
                    successResponse.getTokens().getRefreshToken().getValue(),
                    successResponse.getOIDCTokens().getIDTokenString());
        } else {
            // We got an error response...
            ErrorObject errorObject = response.toErrorResponse().getErrorObject();
            log.error(
                    "Error response while refreshing token (code {}, http status {}): {}",
                    errorObject.getCode(),
                    errorObject.getHTTPStatusCode(),
                    errorObject.getDescription());
        }

        return null;
    }

    private URI getAuthorizeUri(ServerHttpRequest request) throws URISyntaxException {
        return new URI(getBaseUrl(request) + "/authorize");
    }

    private String getBaseUrl(ServerHttpRequest request) {
        String host = request.getHeaders().getFirst("X-Forwarded-Host");
        if (host == null) {
            host = request.getHeaders().getFirst(HttpHeaders.HOST);
        }
        String scheme = request.getHeaders().getFirst("X-Forwarded-Proto");
        if (scheme == null) {
            scheme = request.getURI().getScheme();
        }
        return String.format("%s://%s", scheme, host);
    }

    public ClientAuthentication getClientAuthentication() {
        return new ClientSecretBasic(
                new ClientID(configuration.getClientId()), new Secret(configuration.getClientSecret()));
    }

    public ClientAuthentication getClientAuthenticationPost() {
        return new ClientSecretPost(
                new ClientID(configuration.getClientId()), new Secret(configuration.getClientSecret()));
    }
}
