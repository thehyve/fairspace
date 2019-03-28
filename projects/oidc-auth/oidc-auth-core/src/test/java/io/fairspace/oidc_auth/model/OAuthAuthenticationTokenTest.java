package io.fairspace.oidc_auth.model;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;

public class OAuthAuthenticationTokenTest {
    @Test
    void testTokenSerialization () throws ClassNotFoundException, IOException {
        OAuthAuthenticationToken token1 = new OAuthAuthenticationToken("ACCESSTOKEN","REFRESHTOKEN");
        assert(token1.equals(token1.convertFromBytes(token1.convertToBytes(token1))));
        Map<String,Object> claimsSet = new HashMap();
        claimsSet.put("CLAIM", "OBJECT");
        OAuthAuthenticationToken token2 = new OAuthAuthenticationToken("foo",claimsSet);
        assert(token2.equals(token2.convertFromBytes(token2.convertToBytes(token2))));
    }
}