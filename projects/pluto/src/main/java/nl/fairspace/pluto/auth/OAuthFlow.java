package nl.fairspace.pluto.auth;

import com.nimbusds.oauth2.sdk.*;
import com.nimbusds.oauth2.sdk.auth.ClientAuthentication;
import com.nimbusds.oauth2.sdk.auth.ClientSecretBasic;
import com.nimbusds.oauth2.sdk.auth.ClientSecretPost;
import com.nimbusds.oauth2.sdk.auth.Secret;
import com.nimbusds.oauth2.sdk.id.ClientID;
import com.nimbusds.oauth2.sdk.id.State;
import com.nimbusds.oauth2.sdk.token.AccessToken;
import com.nimbusds.oauth2.sdk.token.RefreshToken;
import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.auth.config.OidcConfig;
import nl.fairspace.pluto.auth.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Map;

@Component
@Slf4j
public class OAuthFlow {
    @Autowired
    OidcConfig configuration;

    @Autowired
    JwtTokenValidator accessTokenValidator;

    @Autowired
    HttpServletRequest request;

    public URI getLoginUri(State state) throws URISyntaxException {
        // The client callback URI, typically pre-registered with the server
        URI callback = getAuthorizeUri();

        // Build the request
        return new AuthorizationRequest.Builder(
                new ResponseType(ResponseType.Value.CODE), new ClientID(configuration.getClientId()))
                .scope(new Scope(configuration.getScope()))
                .state(state)
                .redirectionURI(callback)
                .endpointURI(configuration.getAuthUrl())
                .build().toURI();
    }

    public OAuthAuthenticationToken retrieveToken(String code) throws URISyntaxException, IOException, ParseException {
        return retrieveToken(new AuthorizationCodeGrant(new AuthorizationCode(code), getAuthorizeUri()), getClientAuthentication());
    }

    public OAuthAuthenticationToken retrieveTokenBasicAuth(String username, String password) throws IOException, ParseException {
        return retrieveToken(new ResourceOwnerPasswordCredentialsGrant(username, new Secret(password)), getClientAuthenticationPost());
    }

    private OAuthAuthenticationToken retrieveToken(AuthorizationGrant authorizationGrant, ClientAuthentication clientAuthentication) throws IOException, ParseException {
        // Make the token request
        TokenRequest request = new TokenRequest(configuration.getTokenUrl(), clientAuthentication, authorizationGrant);
        TokenResponse response = TokenResponse.parse(request.toHTTPRequest().send());

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
        AccessTokenResponse successResponse = response.toSuccessResponse();
        AccessToken accessToken = successResponse.getTokens().getAccessToken();
        RefreshToken refreshToken = successResponse.getTokens().getRefreshToken();

        // Retrieve JWT claimsset
        Map<String, Object> claims = accessTokenValidator.parseAndValidate(accessToken.getValue());

        if(claims == null) {
            log.warn("Access token provided by the token endpoint is invalid");
            log.debug("Access token {}", accessToken.getValue());
            return null;
        }

        // Store the access token and refresh token
        OAuthAuthenticationToken token = new OAuthAuthenticationToken(accessToken.getValue(), refreshToken.getValue(), claims);

        return token;
    }

    public OAuthAuthenticationToken refreshToken(OAuthAuthenticationToken token) throws IOException, ParseException {
        // Construct the grant from the saved refresh token
        RefreshToken refreshToken = new RefreshToken(token.getRefreshToken());
        AuthorizationGrant refreshTokenGrant = new RefreshTokenGrant(refreshToken);

        // Make the token request
        TokenRequest request = new TokenRequest(configuration.getTokenUrl(), getClientAuthentication(), refreshTokenGrant);
        TokenResponse response = TokenResponse.parse(request.toHTTPRequest().send());

        if (response.indicatesSuccess()) {
            AccessTokenResponse successResponse = response.toSuccessResponse();

            return new OAuthAuthenticationToken(successResponse.getTokens().getAccessToken().getValue(), successResponse.getTokens().getRefreshToken().getValue());
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

    private URI getAuthorizeUri() throws URISyntaxException {
        return new URI(getBaseUrl() + "/authorize");
    }

    private String getBaseUrl() {
        String host = request.getHeader("X-Forwarded-Host");
        if (host == null) {
            host = request.getHeader(HttpHeaders.HOST);
        }

        String scheme = request.getHeader("X-Forwarded-Proto");
        if (scheme == null) {
            scheme = request.getScheme();
        }

        return String.format("%s://%s", scheme, host);
    }

    public ClientAuthentication getClientAuthentication() {
        return new ClientSecretBasic(new ClientID(configuration.getClientId()), new Secret(configuration.getClientSecret()));
    }

    public ClientAuthentication getClientAuthenticationPost() {
        return new ClientSecretPost(new ClientID(configuration.getClientId()), new Secret(configuration.getClientSecret()));
    }
}
