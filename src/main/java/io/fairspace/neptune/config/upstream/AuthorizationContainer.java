package io.fairspace.neptune.config.upstream;

import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.type.TypeReference;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.jwt.JwtHelper;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.Map;

@Component
public class AuthorizationContainer {
    private static final TypeReference<Map<String, Object>> CLAIMS_MAP = new TypeReference<Map<String, Object>>() {};

    @Autowired
    private HttpServletRequest incomingRequest;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String getAuthorizationHeader() {
        return incomingRequest.getHeader("Authorization");
    }

    public String getJWT() {
        String header = getAuthorizationHeader();
        return header.substring(header.indexOf(' ') + 1).trim();
    }

    public Map<String, Object> getClaims() {
        try {
            return objectMapper.readValue(JwtHelper.decode(getJWT()).getClaims(), CLAIMS_MAP);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    public String getSubject() {
        return (String) getClaims().get("sub");
    }
}
