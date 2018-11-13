package io.fairspace.neptune.config.upstream;

import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class AuthorizationContainer {
    public static final String SUBJECT_CLAIM = "sub";
    public static final String USERNAME_CLAIM = "preferred_username";
    public static final String FULLNAME_CLAIM = "name";

    @Autowired(required = false)
    OAuthAuthenticationToken token;

    public String getAuthorizationHeader() {
        if(token == null) {
            throw new IllegalStateException("Retrieving authorization header is only allowed when a token is present");
        }

        return "Bearer " + token.getAccessToken();
    }

    public String getSubject() {
        return getStringClaim(SUBJECT_CLAIM);
    }

    public String getUsername() {
        return getStringClaim(USERNAME_CLAIM);
    }

    public String getFullname() {
        return getStringClaim(FULLNAME_CLAIM);
    }

    public String getStringClaim(String claim) {
        if(token == null) {
            throw new IllegalStateException("Retrieving token subject is only allowed when a token is present");
        }
        return (String) token.getClaimsSet().get(claim);
    }
}
