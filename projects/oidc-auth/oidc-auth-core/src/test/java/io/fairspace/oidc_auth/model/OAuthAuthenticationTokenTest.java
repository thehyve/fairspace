package io.fairspace.oidc_auth.model;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.util.SerializationUtils;

public class OAuthAuthenticationTokenTest {
    @Test
    void testTokenSerialization() throws ClassNotFoundException, IOException {
        OAuthAuthenticationToken token = new OAuthAuthenticationToken("ACCESSTOKEN", "REFRESHTOKEN");
        byte[] serialized = SerializationUtils.serialize(token);
        OAuthAuthenticationToken deserialized = (OAuthAuthenticationToken) SerializationUtils.deserialize(serialized);

        assert (token.equals(deserialized));
    }

    @Test
    void testTokenSerializationWithMap() throws ClassNotFoundException, IOException {
        Map<String, Object> claimsSet = new HashMap();
        claimsSet.put("CLAIM", "OBJECT");
        OAuthAuthenticationToken token = new OAuthAuthenticationToken("foo", claimsSet);

        byte[] serialized = SerializationUtils.serialize(token);
        OAuthAuthenticationToken deserialized = (OAuthAuthenticationToken) SerializationUtils.deserialize(serialized);

        assert (token.equals(deserialized));

    }
}
