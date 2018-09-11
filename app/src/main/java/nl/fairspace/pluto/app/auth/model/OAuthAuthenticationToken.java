package nl.fairspace.pluto.app.auth.model;

import com.nimbusds.jwt.JWTClaimsSet;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;

import java.text.ParseException;
import java.util.Collections;
import java.util.List;

import static nl.fairspace.pluto.app.auth.config.AuthConstants.AUTHORITIES_CLAIM;

@Getter
@EqualsAndHashCode
@AllArgsConstructor
@Builder(toBuilder = true)
public class OAuthAuthenticationToken {
    public static final String USERNAME_CLAIM = "preferred_username";
    private static final String FULLNAME_CLAIM = "full name";

    private String accessToken;
    private String refreshToken;
    private JWTClaimsSet claimsSet;

    public OAuthAuthenticationToken(String accessToken, JWTClaimsSet claimsSet) {
        this(accessToken, null, claimsSet);
    }

    public OAuthAuthenticationToken(String accessToken, String refreshToken) {
        this(accessToken, refreshToken, null);
    }


    public String getUsername() {
        if(claimsSet == null) {
            return "";
        }

        return claimsSet.getClaim(USERNAME_CLAIM).toString();
    }

    public String getFullName() {
        if(claimsSet == null) {
            return "";
        }

        return claimsSet.getClaim(FULLNAME_CLAIM).toString();
    }

    public List<String> getAuthorities() throws ParseException {
        if(claimsSet == null) {
            return Collections.emptyList();
        }

        return claimsSet.getStringListClaim(AUTHORITIES_CLAIM);
    }


}
