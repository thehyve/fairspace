package nl.fairspace.pluto.auth;

import java.util.HashMap;

import org.apache.commons.lang3.SerializationUtils;
import org.junit.jupiter.api.Test;

import nl.fairspace.pluto.auth.model.OAuthAuthenticationToken;

public class OAuthAuthenticationTokenTest {
    @Test
    void testTokenSerialization() {
        OAuthAuthenticationToken token = new OAuthAuthenticationToken("ACCESSTOKEN", "REFRESHTOKEN", "IDTOKEN");
        byte[] serialized = SerializationUtils.serialize(token);
        OAuthAuthenticationToken deserialized = SerializationUtils.deserialize(serialized);

        assert (token.equals(deserialized));
    }

    @Test
    void testTokenSerializationWithMap() {
        var claimsSet = new HashMap<String, Object>();
        claimsSet.put("CLAIM", "OBJECT");
        OAuthAuthenticationToken token = new OAuthAuthenticationToken("foo", claimsSet);

        byte[] serialized = SerializationUtils.serialize(token);
        OAuthAuthenticationToken deserialized = SerializationUtils.deserialize(serialized);

        assert (token.equals(deserialized));
    }
}
