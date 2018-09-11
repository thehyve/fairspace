package nl.fairspace.pluto.app.auth.model;

import com.nimbusds.jwt.JWTClaimsSet;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;

@Getter
@EqualsAndHashCode
@AllArgsConstructor
@Builder(toBuilder = true)
public class OAuthAuthenticationToken {
    private String accessToken;
    private String refreshToken;
    private JWTClaimsSet claimsSet;

    public OAuthAuthenticationToken(String accessToken, JWTClaimsSet claimsSet) {
        this(accessToken, null, claimsSet);
    }

    public OAuthAuthenticationToken(String accessToken, String refreshToken) {
        this(accessToken, refreshToken, null);
    }

}
