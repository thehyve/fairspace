package io.fairspace.neptune.config;

import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import static io.fairspace.neptune.config.upstream.AuthorizationContainer.FULLNAME_CLAIM;
import static io.fairspace.neptune.config.upstream.AuthorizationContainer.SUBJECT_CLAIM;
import static io.fairspace.neptune.config.upstream.AuthorizationContainer.USERNAME_CLAIM;

@Configuration
@Profile("noAuth")
public class NoAuthTokenConfiguration {
    @Bean
    OAuthAuthenticationToken fakeToken() {
        Map<String, Object> claimsSet = new HashMap<>();
        claimsSet.put(SUBJECT_CLAIM, "fake-subject");
        claimsSet.put(FULLNAME_CLAIM, "John Snow");
        claimsSet.put(USERNAME_CLAIM, "my-username");

        return new OAuthAuthenticationToken("fake-token", "fake-refresh-token", claimsSet);
    }
}
