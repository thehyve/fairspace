package io.fairspace.saturn;

import org.eclipse.jetty.http.HttpCompliance;
import org.eclipse.jetty.io.EndPoint;
import org.eclipse.jetty.server.Connector;
import org.eclipse.jetty.server.HttpChannel;
import org.eclipse.jetty.server.HttpConfiguration;
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

    public static class ContextTask implements Runnable {
        private final HttpConnection connection = getCurrentConnection();
        private final Runnable runnable;

        public ContextTask(Runnable runnable) {
            this.runnable = runnable;
        }

        @Override
        public final void run() {
            Hack.injectConnection(connection);
            runnable.run();
        }
    }

    private static class Hack extends HttpConnection {
        private Hack(HttpConfiguration config, Connector connector, EndPoint endPoint, HttpCompliance compliance, boolean recordComplianceViolations) {
            super(config, connector, endPoint, compliance, recordComplianceViolations);
        }

        static void injectConnection(HttpConnection connection) {
            setCurrentConnection(connection);
        }
    }
}
