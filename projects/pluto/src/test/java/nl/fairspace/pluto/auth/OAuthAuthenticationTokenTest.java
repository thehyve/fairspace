package nl.fairspace.pluto.auth;

import nl.fairspace.pluto.auth.model.*;
import org.apache.commons.lang3.*;
import org.junit.jupiter.api.*;

import java.util.*;

public class OAuthAuthenticationTokenTest {
    @Test
    void testTokenSerialization() {
        OAuthAuthenticationToken token = new OAuthAuthenticationToken("ACCESSTOKEN", "REFRESHTOKEN");
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
