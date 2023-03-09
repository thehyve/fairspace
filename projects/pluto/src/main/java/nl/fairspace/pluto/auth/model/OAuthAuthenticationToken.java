package nl.fairspace.pluto.auth.model;

import lombok.*;
import lombok.extern.slf4j.*;

import java.io.*;
import java.util.*;

import static java.util.stream.Collectors.*;

@Getter
@EqualsAndHashCode
@AllArgsConstructor
@Builder(toBuilder = true)
@ToString(exclude = "claimsSet")
@Slf4j
public class OAuthAuthenticationToken implements Serializable {
    @Serial
    private static final long serialVersionUID = 42L;

    public static final String AUTHORITIES_CLAIM = "authorities";
    public static final String USERNAME_CLAIM = "preferred_username";
    public static final String FULLNAME_CLAIM = "name";
    public static final String FIRSTNAME_CLAIM = "given_name";
    public static final String LASTNAME_CLAIM = "family_name";
    public static final String SUBJECT_CLAIM = "sub";
    public static final String EMAIL_CLAIM = "email";

    private final String accessToken;
    private final String refreshToken;
    private final Map<String,Object> claimsSet;

    public OAuthAuthenticationToken(String accessToken, Map<String,Object> claimsSet) {
        this(accessToken, null, claimsSet);
    }

    public OAuthAuthenticationToken(String accessToken, String refreshToken) {
        this(accessToken, refreshToken, null);
    }

    public String getStringClaim(String claim) {
        if(claimsSet == null) {
            log.warn("No claimsset provided in OAuth token");
            return "";
        }

        Object claimValue = claimsSet.get(claim);

        if(claimValue == null) {
            log.warn("Claim {} not found in claimsset", claim);
            return "";
        }

        return claimValue.toString();
    }

    public String getSubjectClaim() {
        return getStringClaim(SUBJECT_CLAIM);
    }

    public String getUsername() {
        return getStringClaim(USERNAME_CLAIM);
    }

    public String getFullName() {
        return getStringClaim(FULLNAME_CLAIM);
    }

    public String getEmail() {
        return getStringClaim(EMAIL_CLAIM);
    }

    public Set<String> getAuthorities() {
        if(claimsSet == null) {
            log.warn("No claimsset provided in OAuth token");
            return Set.of();
        }

        Object authorities = claimsSet.get(AUTHORITIES_CLAIM);

        if(authorities == null) {
            log.trace("No authorities provided in OAuth token");
            return null;
        }

        List<?> list = (List<?>) authorities;

        return list.stream().map(Object::toString).collect(toSet());
    }
}
