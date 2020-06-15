package io.fairspace.saturn.webdav;

import io.milton.http.EventListener;
import io.milton.http.FileItem;
import io.milton.http.Request;
import io.milton.http.Response;
import io.milton.resource.Resource;

import java.util.Map;

import static io.fairspace.saturn.audit.Audit.audit;

class AuditEventListener implements EventListener {
    @Override
    public void onPost(Request request, Response response, Resource resource, Map<String, String> params, Map<String, FileItem> files) { }

    @Override
    public void onGet(Request request, Response response, Resource resource, Map<String, String> params) { }

    @Override
    public void onProcessResourceStart(Request request, Response response, Resource resource) { }

    @Override
    public void onProcessResourceFinish(Request request, Response response, Resource resource, long duration) {
        audit("FS_" + request.getMethod(), "resource", resource, "success", response.getStatus().code < 300);
    }
}
