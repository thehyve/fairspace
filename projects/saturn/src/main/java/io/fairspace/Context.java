package io.fairspace;

import org.eclipse.jetty.server.HttpChannel;
import org.eclipse.jetty.server.HttpConnection;

import javax.servlet.http.HttpServletRequest;

import java.util.Optional;

import static java.util.Optional.ofNullable;
import static org.eclipse.jetty.server.HttpConnection.getCurrentConnection;

public class Context {
    public static Optional<HttpServletRequest> currentRequest() {
        return ofNullable(getCurrentConnection())
                .map(HttpConnection::getHttpChannel)
                .map(HttpChannel::getRequest);
    }
}
