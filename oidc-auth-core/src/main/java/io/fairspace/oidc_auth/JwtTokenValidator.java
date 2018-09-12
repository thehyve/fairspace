package io.fairspace.oidc_auth;

import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.JWTProcessor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Map;

@Component
@Slf4j
public class JwtTokenValidator {
    private JWTProcessor jwtProcessor;

    @Autowired
    public JwtTokenValidator(JWTProcessor jwtProcessor) {
        this.jwtProcessor = jwtProcessor;
    }

    public Map<String, Object> parseAndValidate(String token) {
        if(StringUtils.isEmpty(token)) {
            log.debug("Token provided for validation is empty");
            return null;
        }

        // Process the token
        try {
            SecurityContext ctx = null; // optional context parameter, not required here
            JWTClaimsSet claimsSet = jwtProcessor.process(token, ctx);

            if(claimsSet != null) {
                return claimsSet.getClaims();
            } else {
                log.warn("Provided JWT is valid and could be parsed, but does not result in a claimsset");
                return null;
            }
        } catch(Exception e) {
            log.warn("Provided JWT is invalid or not secured: {}", e.getMessage() );
            log.debug("Stacktrace", e);
            return null;
        }
    }
}
