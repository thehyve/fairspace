package io.fairspace.neptune.config;

import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.HashMap;

import static io.fairspace.neptune.config.upstream.AuthorizationContainer.SUBJECT_CLAIM;

@Configuration
@Profile("noAuth")
public class NoAuthTokenConfiguration {
    @Bean
    OAuthAuthenticationToken fakeToken() {
        HashMap<String, Object> claimsSet = new HashMap<>();
        claimsSet.put(SUBJECT_CLAIM, "fake-subject");
        return new OAuthAuthenticationToken("fake-token", "fake-refresh-token", claimsSet);
    }
}
