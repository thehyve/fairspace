package io.fairspace.saturn.auth;

import io.fairspace.saturn.config.Services;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

import static io.fairspace.saturn.rdf.SparqlUtils.generateMetadataIri;
import static io.fairspace.saturn.services.users.User.setCurrentUser;

public class UserIdentityFilter implements Filter {
    public static final String ADMIN_ROLE = "organisation-admin";
    private final Services svc;

    public UserIdentityFilter(Services svc) {
        this.svc = svc;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        var userId = ((HttpServletRequest) request).getRemoteUser();
        if (userId != null) {
            var user = svc.getUserService().getUser(generateMetadataIri(userId));
            if (user != null) {
                user.setAdmin(((HttpServletRequest) request).isUserInRole(ADMIN_ROLE));
            }
            setCurrentUser(user);
        }

        chain.doFilter(request, response);
    }

    @Override
    public void init(FilterConfig filterConfig) {}

    @Override
    public void destroy() {}
}
