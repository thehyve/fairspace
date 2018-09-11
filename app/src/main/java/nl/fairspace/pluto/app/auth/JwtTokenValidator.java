package nl.fairspace.pluto.app.auth;

import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.JWTProcessor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@Slf4j
@Profile("!noAuth")
public class JwtTokenValidator {
    private JWTProcessor jwtProcessor;

    @Autowired
    public JwtTokenValidator(JWTProcessor jwtProcessor) {
        this.jwtProcessor = jwtProcessor;
    }

    public JWTClaimsSet parseAndValidate(String token) {
        if(token == null || StringUtils.isEmpty(token)) {
            log.debug("Token provided for validation is empty");
            return null;
        }

        // Process the token
        try {
            SecurityContext ctx = null; // optional context parameter, not required here
            return jwtProcessor.process(token, ctx);
        } catch(Exception e) {
            log.warn("Provided JWT is invalid or not secured: {}", e.getMessage() );
            log.debug("Stacktrace", e);
            return null;
        }
    }
}
