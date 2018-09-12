package io.fairspace.oidc_auth.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;

import java.text.ParseException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static io.fairspace.oidc_auth.config.AuthConstants.AUTHORITIES_CLAIM;

@Getter
@EqualsAndHashCode
@AllArgsConstructor
@Builder(toBuilder = true)
public class OAuthAuthenticationToken {
    public static final String USERNAME_CLAIM = "preferred_username";
    private static final String FULLNAME_CLAIM = "full name";

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
            return "";
        }

        Object username = claimsSet.get(USERNAME_CLAIM);

        return username == null ? null : username.toString();
    }

    public String getFullName() {
        if(claimsSet == null) {
            return "";
        }

        Object fullname = claimsSet.get(USERNAME_CLAIM);

        return fullname == null ? null : fullname.toString();
    }

    public List<String> getAuthorities() throws ParseException {
        if(claimsSet == null) {
            return Collections.emptyList();
        }

        Object authorities = claimsSet.get(AUTHORITIES_CLAIM);

        if(authorities == null) {
            return null;
        }

        List<?> list = (List<?>) authorities;

        return list.stream().map(o -> o.toString()).collect(Collectors.toList());
    }


}
