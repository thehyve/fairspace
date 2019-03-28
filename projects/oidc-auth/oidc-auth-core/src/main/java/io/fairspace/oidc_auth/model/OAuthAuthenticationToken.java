package io.fairspace.oidc_auth.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.ToString;
import lombok.extern.slf4j.Slf4j;

import java.io.Serializable;
import java.io.IOException;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.commons.lang3.SerializationUtils;

import static io.fairspace.oidc_auth.config.AuthConstants.AUTHORITIES_CLAIM;

@Getter
@EqualsAndHashCode
@AllArgsConstructor
@Builder(toBuilder = true)
@ToString(exclude = "claimsSet")
@Slf4j
public class OAuthAuthenticationToken implements Serializable {
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

    public String getUsername() {
        return getStringClaim(USERNAME_CLAIM);
    }

    public String getFullName() {
        return getStringClaim(FULLNAME_CLAIM);
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

    public byte[] convertToBytes(Object object) throws IOException {
        return SerializationUtils.serialize(this);
    }

    public Object convertFromBytes(byte[] bytes) throws IOException, ClassNotFoundException {
        return SerializationUtils.deserialize(bytes);
    }
}
