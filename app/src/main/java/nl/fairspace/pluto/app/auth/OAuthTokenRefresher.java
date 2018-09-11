package nl.fairspace.pluto.app.auth;

import com.nimbusds.oauth2.sdk.AccessTokenResponse;
import com.nimbusds.oauth2.sdk.AuthorizationGrant;
import com.nimbusds.oauth2.sdk.ErrorObject;
import com.nimbusds.oauth2.sdk.ParseException;
import com.nimbusds.oauth2.sdk.RefreshTokenGrant;
import com.nimbusds.oauth2.sdk.TokenRequest;
import com.nimbusds.oauth2.sdk.TokenResponse;
import com.nimbusds.oauth2.sdk.token.RefreshToken;
import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.app.auth.model.OAuthAuthenticationToken;
import nl.fairspace.pluto.app.config.dto.SecurityConfig;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Slf4j
@Profile("!noAuth")
public class OAuthTokenRefresher {
    SecurityConfig configuration;

    public OAuthAuthenticationToken refreshToken(OAuthAuthenticationToken token) throws IOException, ParseException {
        // Construct the grant from the saved refresh token
        RefreshToken refreshToken = new RefreshToken(token.getRefreshToken());
        AuthorizationGrant refreshTokenGrant = new RefreshTokenGrant(refreshToken);

        // Make the token request
        TokenRequest request = new TokenRequest(configuration.getTokenUri(), configuration.getClientAuthentication(), refreshTokenGrant);
        TokenResponse response = TokenResponse.parse(request.toHTTPRequest().send());

        if (!response.indicatesSuccess()) {
            // We got an error response...
            ErrorObject errorObject = response.toErrorResponse().getErrorObject();
            log.error(
                    "Error response while refreshing token (http status {}): {} - {}",
                    errorObject.getHTTPStatusCode(),
                    errorObject.getCode(),
                    errorObject.getDescription());
        }

        AccessTokenResponse successResponse = response.toSuccessResponse();

        return new OAuthAuthenticationToken(successResponse.getTokens().getAccessToken().getValue(), successResponse.getTokens().getRefreshToken().getValue());
    }
}
