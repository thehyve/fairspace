package io.fairspace.saturn.webdav;

import io.milton.http.Request;
import io.milton.http.Response;
import io.milton.http.http11.ContentGenerator;
import io.milton.resource.Resource;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import static io.fairspace.saturn.webdav.WebDAVServlet.getErrorMessage;

public class AdvancedContentGenerator implements ContentGenerator {
    @Override
    public void generate(Resource resource, Request request, Response response, Response.Status status) {
        var message = getErrorMessage();

        if (message == null) {
            message = switch (status) {
                case SC_METHOD_NOT_ALLOWED -> "Method not allowed";
                case SC_NOT_FOUND -> "Not found";
                case SC_CONFLICT -> "Conflict";
                case SC_INTERNAL_SERVER_ERROR -> "Server error";
                case SC_UNAUTHORIZED -> "Not authorised";
                default -> "Unknown error";
            };
        }

        try {
            var outputStream = response.getOutputStream();
            outputStream.write(message.getBytes(StandardCharsets.UTF_8));
            outputStream.flush();
        } catch (IOException ignore) {
        }
    }
}
