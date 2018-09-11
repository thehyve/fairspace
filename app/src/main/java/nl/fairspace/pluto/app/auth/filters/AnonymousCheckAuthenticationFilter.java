package nl.fairspace.pluto.app.auth.filters;

import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.app.auth.model.OAuthAuthenticationToken;

import javax.servlet.http.HttpServletRequest;
import java.text.ParseException;
import java.util.Arrays;

@Slf4j
public class AnonymousCheckAuthenticationFilter extends CheckAuthenticationFilter {
    @Override
    protected boolean isAuthorized(HttpServletRequest request) {
        return true;
    }
}
