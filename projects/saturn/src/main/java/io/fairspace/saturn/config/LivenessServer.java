package io.fairspace.saturn.config;

import jakarta.servlet.http.*;
import lombok.extern.log4j.*;
import org.eclipse.jetty.server.*;
import org.eclipse.jetty.servlet.*;

@Log4j2
public class LivenessServer implements AutoCloseable {
    public static class LivenessServlet extends HttpServlet {
        @Override
        protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
            resp.setStatus(HttpServletResponse.SC_OK);
        }
    }

    private final Server server;

    /**
     * Starts a Jetty server at port 8091 with endpoint <code>/liveness</code> that
     * always returns <code>OK</code>.
     */
    public LivenessServer() {
        log.info("Start liveness endpoint");

        server = new Server(ConfigLoader.CONFIG.livenessPort);
        var context = new ServletContextHandler();
        context.addServlet(LivenessServer.LivenessServlet.class, "/liveness");
        server.setHandler(context);
        try {
            server.start();
        } catch (Exception e) {
            throw new RuntimeException("Could not start liveness endpoint", e);
        }
        log.info("Liveness endpoint has started");
    }

    @Override
    public void close() throws Exception {
        log.info("Closing liveness endpoint");
        server.stop();
    }
}
