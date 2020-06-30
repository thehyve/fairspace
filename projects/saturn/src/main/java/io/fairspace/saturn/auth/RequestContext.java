package io.fairspace.saturn.auth;

import io.fairspace.saturn.services.users.User;
import org.eclipse.jetty.server.HttpChannel;
import org.eclipse.jetty.server.HttpConnection;

import javax.servlet.http.HttpServletRequest;
import java.util.Optional;

public class RequestContext {
    private static final ThreadLocal<HttpServletRequest> currentRequest = new ThreadLocal<>();

    public static HttpServletRequest getCurrentRequest() {
        return Optional.ofNullable(HttpConnection.getCurrentConnection())
                .map(HttpConnection::getHttpChannel)
                .map(HttpChannel::getRequest)
                .map(r -> (HttpServletRequest)r)
                .orElseGet(currentRequest::get);
    }

    public static void setCurrentRequest(HttpServletRequest request) {
        currentRequest.set(request);
    }

    public static User getCurrentUser() {
        var request = currentRequest.get();
        return request == null ? null : (User) request.getAttribute(User.class.getName());
    }

    public static boolean showDeletedFiles() {
        var request = currentRequest.get();
        return (request != null) && "on".equalsIgnoreCase(request.getHeader("Show-Deleted"));
    }
}
