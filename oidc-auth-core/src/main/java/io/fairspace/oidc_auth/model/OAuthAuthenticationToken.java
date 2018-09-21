package io.fairspace.oidc_auth.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static io.fairspace.oidc_auth.config.AuthConstants.AUTHORITIES_CLAIM;

@Getter
@EqualsAndHashCode
@AllArgsConstructor
@Builder(toBuilder = true)
@Slf4j
public class OAuthAuthenticationToken {
    public static final String USERNAME_CLAIM = "preferred_username";
    public static final String FULLNAME_CLAIM = "name";
    public static final String FIRSTNAME_CLAIM = "given_name";
    public static final String LASTNAME_CLAIM = "family_name";
    public static final String SUBJECT_CLAIM = "sub";

    private String accessToken;
    private String refreshToken;
    private Map<String,Object> claimsSet;

    public OAuthAuthenticationToken(String accessToken, Map<String,Object> claimsSet) {
        this(accessToken, null, claimsSet);
    }

    public OAuthAuthenticationToken(String accessToken, String refreshToken) {
        this(accessToken, refreshToken, null);
    }

    public String getUsername() {
        if(claimsSet == null) {
            log.warn("No claimsset provided in OAuth token");
            return "";
        }

        Object username = claimsSet.get(USERNAME_CLAIM);

        if(username == null) {
            log.warn("No username provided in OAuth token");
            return "";
        }

        return username.toString();
    }

    public String getFullName() {
        if(claimsSet == null) {
            log.warn("No claimsset provided in OAuth token");
            return "";
        }

        Object fullname = claimsSet.get(FULLNAME_CLAIM);

        if(fullname == null) {
            log.warn("No fullname provided in OAuth token");
            return "";
        }

        return fullname.toString();
    }

    public List<String> getAuthorities() {
        if(claimsSet == null) {
            log.warn("No claimsset provided in OAuth token");
            return Collections.emptyList();
        }

        Object authorities = claimsSet.get(AUTHORITIES_CLAIM);

        if(authorities == null) {
            log.warn("No authorities provided in OAuth token");
            return null;
        }

        List<?> list = (List<?>) authorities;

        return list.stream().map(o -> o.toString()).collect(Collectors.toList());
    }


}
