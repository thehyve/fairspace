package io.fairspace.neptune.config.upstream;

import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class AuthorizationContainer {
    public static final String SUBJECT_CLAIM = "sub";

    @Autowired(required = false)
    OAuthAuthenticationToken token;

    public String getAuthorizationHeader() {
        if(token == null) {
            throw new IllegalStateException("Retrieving authorization header is only allowed when a token is present");
        }

        return "Bearer " + token.getAccessToken();
    }

    public String getSubject() {
        if(token == null) {
            throw new IllegalStateException("Retrieving token subject is only allowed when a token is present");
        }
        return (String) token.getClaimsSet().get(SUBJECT_CLAIM);
    }
}
