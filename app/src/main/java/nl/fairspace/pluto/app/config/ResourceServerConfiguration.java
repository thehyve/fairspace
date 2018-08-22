package nl.fairspace.pluto.app.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.oauth2.resource.AuthoritiesExtractor;
import org.springframework.boot.autoconfigure.security.oauth2.resource.FixedAuthoritiesExtractor;
import org.springframework.boot.autoconfigure.security.oauth2.resource.FixedPrincipalExtractor;
import org.springframework.boot.autoconfigure.security.oauth2.resource.PrincipalExtractor;
import org.springframework.boot.autoconfigure.security.oauth2.resource.ResourceServerProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.provider.OAuth2Authentication;
import org.springframework.security.oauth2.provider.OAuth2Request;
import org.springframework.security.oauth2.provider.token.AccessTokenConverter;
import org.springframework.security.oauth2.provider.token.DefaultAccessTokenConverter;
import org.springframework.security.oauth2.provider.token.DefaultUserAuthenticationConverter;
import org.springframework.security.oauth2.provider.token.TokenStore;
import org.springframework.security.oauth2.provider.token.store.JwtAccessTokenConverter;
import org.springframework.security.oauth2.provider.token.store.jwk.JwkTokenStore;

import java.util.List;
import java.util.Map;

@Configuration
public class ResourceServerConfiguration {

    @Autowired
    ResourceServerProperties resource;

    @Bean
    public TokenStore jwkTokenStore() {
        JwtAccessTokenConverter jwtAccessTokenConverter = new JwtAccessTokenConverter();
        jwtAccessTokenConverter.setAccessTokenConverter(defaultAccessTokenConverter());
        return new JwkTokenStore(this.resource.getJwk().getKeySetUri(), jwtAccessTokenConverter);
    }

    public DefaultAccessTokenConverter defaultAccessTokenConverter() {
        DefaultAccessTokenConverter defaultAccessTokenConverter = new DefaultAccessTokenConverter();
        defaultAccessTokenConverter.setUserTokenConverter(new Oauth2UserAuthenticationConverter());
        return defaultAccessTokenConverter;
    }

    class Oauth2UserAuthenticationConverter extends DefaultUserAuthenticationConverter {
        private AuthoritiesExtractor authoritiesExtractor = new FixedAuthoritiesExtractor();
        private PrincipalExtractor principalExtractor = new FixedPrincipalExtractor();

        @Override
        public Authentication extractAuthentication(Map<String, ?> map) {
            Map<String,Object> mutableMap = (Map<String, Object>) map;

            Object principal = principalExtractor.extractPrincipal(mutableMap);

            // Set client ID in the details map to allow refreshing the token
            // The calling code will overwrite the request created below
            if(map.containsKey(AccessTokenConverter.AUD) && !map.containsKey(AccessTokenConverter.CLIENT_ID)) {
                mutableMap.put(AccessTokenConverter.CLIENT_ID, map.get(AccessTokenConverter.AUD));
            }

            List<GrantedAuthority> authorities = authoritiesExtractor.extractAuthorities((Map<String, Object>) map);

            OAuth2Request request = new OAuth2Request(null, null, null, true, null,
                    null, null, null, null);
            UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(
                    principal, "N/A", authorities);
            token.setDetails(map);
            return new OAuth2Authentication(request, token);
        }
    }

}
