package io.fairspace.saturn.webdav;

import io.milton.event.Event;
import io.milton.event.EventListener;
import io.milton.event.ResponseEvent;

import static io.fairspace.saturn.audit.Audit.audit;

class AuditEventListener implements EventListener {
    @Override
    public void onEvent(Event e) {
        if (e instanceof ResponseEvent) {
            var re = (ResponseEvent) e;
            var status = re.getResponse().getStatus();
            var success = status != null && status.code < 300;
            var path = resourcePath(re.getRequest().getAbsolutePath());

            switch (re.getRequest().getMethod()) {
                case GET -> audit("FS_READ",
                        "path", path,
                        "version", re.getRequest().getHeaders().get("Version"),
                        "success", success);
                case PROPPATCH -> audit("FS_PROPPATCH",
                        "path", path,
                        "success", success);
                case MKCOL -> audit("FS_MKDIR",
                        "path", path,
                        "success", success);
                case COPY -> audit("FS_COPY",
                        "path", path,
                        "destination", resourcePath(re.getRequest().getDestinationHeader()),
                        "success", success);
                case MOVE -> audit("FS_MOVE",
                        "path", path,
                        "destination", resourcePath(re.getRequest().getDestinationHeader()),
                        "success", success);
                case DELETE -> audit("FS_DELETE",
                        "path", path,
                        "success", success);
                case PUT -> audit("FS_WRITE",
                        "path", path,
                        "success", success);
                case POST -> audit("FS_ACTION",
                        "path", path,
                        "parameters", re.getRequest().getParams(),
                        "success", success);
            }
        }
    }

    private static String resourcePath(String path) {
        return path.substring("/api/webdav".length());
    }
}
