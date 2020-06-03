package io.fairspace.saturn.auth;

import io.fairspace.saturn.services.users.User;

import javax.servlet.http.HttpServletRequest;

public class RequestContext {
    public static final ThreadLocal<HttpServletRequest> currentRequest = new ThreadLocal<>();

    public static User getCurrentUser() {
        var request = currentRequest.get();
        return request == null ? null : (User) request.getAttribute(User.class.getName());
    }

    public static boolean showDeletedFiles() {
        var request = currentRequest.get();
        return (request != null) && "on".equalsIgnoreCase(request.getHeader("Show-Deleted"));
    }
}
