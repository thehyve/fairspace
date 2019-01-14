package io.fairspace.oidc_auth.sso;

import com.nimbusds.oauth2.sdk.AccessTokenResponse;
import com.nimbusds.oauth2.sdk.AuthorizationCode;
import com.nimbusds.oauth2.sdk.AuthorizationCodeGrant;
import com.nimbusds.oauth2.sdk.AuthorizationGrant;
import com.nimbusds.oauth2.sdk.AuthorizationRequest;
import com.nimbusds.oauth2.sdk.ErrorObject;
import com.nimbusds.oauth2.sdk.ParseException;
import com.nimbusds.oauth2.sdk.RefreshTokenGrant;
import com.nimbusds.oauth2.sdk.ResponseType;
import com.nimbusds.oauth2.sdk.Scope;
import com.nimbusds.oauth2.sdk.TokenErrorResponse;
import com.nimbusds.oauth2.sdk.TokenRequest;
import com.nimbusds.oauth2.sdk.TokenResponse;
import com.nimbusds.oauth2.sdk.auth.ClientAuthentication;
import com.nimbusds.oauth2.sdk.auth.ClientSecretBasic;
import com.nimbusds.oauth2.sdk.auth.Secret;
import com.nimbusds.oauth2.sdk.id.ClientID;
import com.nimbusds.oauth2.sdk.id.State;
import com.nimbusds.oauth2.sdk.token.AccessToken;
import com.nimbusds.oauth2.sdk.token.RefreshToken;
import io.fairspace.oidc_auth.JwtTokenValidator;
import io.fairspace.oidc_auth.config.OidcConfig;
import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import lombok.extern.slf4j.Slf4j;
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
                .endpointURI(configuration.getAuthUri())
                .build().toURI();
    }

    public OAuthAuthenticationToken retrieveToken(String code) throws URISyntaxException, IOException, ParseException {
        AuthorizationCode authorizationCode = new AuthorizationCode(code);
        AuthorizationGrant codeGrant = new AuthorizationCodeGrant(authorizationCode, getAuthorizeUri());

        // Make the token request
        TokenRequest request = new TokenRequest(configuration.getTokenUri(), getClientAuthentication(), codeGrant);
        TokenResponse response = TokenResponse.parse(request.toHTTPRequest().send());

        // On failure, tell the user
        if (!response.indicatesSuccess()) {
            // We got an error response...
            TokenErrorResponse errorResponse = response.toErrorResponse();
            log.warn("Unsuccessful response from authorization grant request: {}", errorResponse.getErrorObject().getDescription());
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
        return new OAuthAuthenticationToken(accessToken.getValue(), refreshToken.getValue(), claims);
    }

    public OAuthAuthenticationToken refreshToken(OAuthAuthenticationToken token) throws IOException, ParseException {
        // Construct the grant from the saved refresh token
        RefreshToken refreshToken = new RefreshToken(token.getRefreshToken());
        AuthorizationGrant refreshTokenGrant = new RefreshTokenGrant(refreshToken);

        // Make the token request
        TokenRequest request = new TokenRequest(configuration.getTokenUri(), getClientAuthentication(), refreshTokenGrant);
        TokenResponse response = TokenResponse.parse(request.toHTTPRequest().send());

        if (response.indicatesSuccess()) {
            AccessTokenResponse successResponse = response.toSuccessResponse();
            return new OAuthAuthenticationToken(successResponse.getTokens().getAccessToken().getValue(), successResponse.getTokens().getRefreshToken().getValue());
        } else {
            // We got an error response...
            ErrorObject errorObject = response.toErrorResponse().getErrorObject();
            log.error(
                    "Error response while refreshing token (http status {}): {} - {}",
                    errorObject.getHTTPStatusCode(),
                    errorObject.getCode(),
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

}
