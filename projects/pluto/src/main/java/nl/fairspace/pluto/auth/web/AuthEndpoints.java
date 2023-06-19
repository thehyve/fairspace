package nl.fairspace.pluto.auth.web;

import com.nimbusds.oauth2.sdk.ParseException;
import com.nimbusds.oauth2.sdk.id.State;
import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.auth.AuthConstants;
import nl.fairspace.pluto.auth.OAuthFlow;
import nl.fairspace.pluto.auth.config.OidcConfig;
import nl.fairspace.pluto.auth.model.OAuthAuthenticationToken;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebSession;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.net.URISyntaxException;

import static nl.fairspace.pluto.auth.AuthConstants.*;

@RestController
@Slf4j
public class AuthEndpoints {
    private static final String DEFAULT_REDIRECT_LOCATION = "/";

    final OidcConfig configuration;
    final OAuthFlow oAuthFlow;

    public AuthEndpoints(OidcConfig configuration, OAuthFlow oAuthFlow) {
        this.configuration = configuration;
        this.oAuthFlow = oAuthFlow;
    }

    @GetMapping("/login")
    public Mono<ResponseEntity<String>> login(
            ServerWebExchange exchange,
            @RequestParam(name = "redirectUrl", required = false) String redirectUrl) throws URISyntaxException {
       return exchange.getSession().map(session -> {
           // Generate random state string for pairing the response to the request
           State state = new State();
           session.getAttributes().put(LOGIN_STATE_SESSION_ATTRIBUTE, state.getValue());

           // If a redirectUrl is specified, store it to use later on
           if (StringUtils.hasText(redirectUrl)) {
               session.getAttributes().put(PREVIOUS_REQUEST_SESSION_ATTRIBUTE, redirectUrl);
           }

           String location = null;
           try {
               location = oAuthFlow.getLoginUri(exchange.getRequest(), state).toString();
           } catch (URISyntaxException e) {
               throw new RuntimeException(e); // todo fix
           }

           return ResponseEntity
                   .status(HttpStatus.SEE_OTHER)
                   .header("Location", location)
                   .build();
       });
    }

    @GetMapping("/logout")
    public Mono<ResponseEntity<Void>> logout(ServerWebExchange exchange) {
        return exchange.getSession().doOnSuccess(session -> {
                    // Invalidate current session
                    session.getAttributes().remove(AUTHORIZATION_SESSION_ATTRIBUTE);
                }).map(WebSession::invalidate).then(Mono.just(ResponseEntity
                        .status(HttpStatus.SEE_OTHER)
                        .header("Location", getAuthProviderLogoutUrl(exchange.getAttribute(AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE)))
                        .build()));
    }

    @GetMapping("/authorize")
    public Mono<ResponseEntity<String>> authorize(
            ServerWebExchange exchange,
            @RequestParam("state") String state,
            @RequestParam("code") String code) {
        return exchange.getSession().map(session -> {
            // Match state to avoid CSRF attacks
            if (state == null || !state.equals(session.getAttribute(LOGIN_STATE_SESSION_ATTRIBUTE))) {
                log.warn("Provided state parameter does not equal the one stored");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            // Retrieve the token from the auth provider
            OAuthAuthenticationToken token = null;
            try {
                token = oAuthFlow.retrieveToken(code, exchange.getRequest());
            } catch (IOException e) {
                throw new RuntimeException(e);
            } catch (ParseException e) {
                throw new RuntimeException(e);
            } // TODO fix error handling
            catch (URISyntaxException e) {
                throw new RuntimeException(e);
            }

            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            // Store the token in session for future usage
            session.getAttributes().put(AUTHORIZATION_SESSION_ATTRIBUTE, token);

            // Redirect the user
            String location = getRedirectLocation(session);
            return ResponseEntity
                    .status(HttpStatus.SEE_OTHER)
                    .header("Location", location)
                    .build();
        });
    }

    private String getRedirectLocation(WebSession session) {
        String location = (String) session.getAttribute(PREVIOUS_REQUEST_SESSION_ATTRIBUTE);
        return location != null ? location : DEFAULT_REDIRECT_LOCATION;
    }

    private String getAuthProviderLogoutUrl(OAuthAuthenticationToken authenticationToken) {
        String idToken = authenticationToken == null ? "" : authenticationToken.getIdToken();
        return String.format(configuration.getLogoutUrl(), configuration.getRedirectAfterLogoutUrl(), idToken);
    }
}
