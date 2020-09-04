package io.fairspace.saturn.webdav;

import io.milton.http.Request;
import io.milton.http.Response;
import io.milton.http.http11.ContentGenerator;
import io.milton.resource.Resource;

import java.nio.charset.StandardCharsets;

import static io.fairspace.saturn.webdav.WebDAVServlet.getErrorMessage;

public class AdvancedContentGenerator implements ContentGenerator {
    @Override
    public void generate(Resource resource, Request request, Response response, Response.Status status) {
        String message;

        var errorMessage = getErrorMessage();

        if (errorMessage != null) {
            message = "<html><body><h1>" + errorMessage + "</h1></body></html>";
        } else {
            message = switch (status) {
                case SC_METHOD_NOT_ALLOWED -> "<html><body><h1>Method Not Allowed</h1></body></html>";
                case SC_NOT_FOUND -> "<html><body><h1>" + request.getAbsolutePath() + " Not Found (404)</h1></body></html>";
                case SC_CONFLICT -> "<html><body><h1>Conflict</h1></body></html>";
                case SC_INTERNAL_SERVER_ERROR -> "<html><body><h1>Server Error</h1></body></html>";
                case SC_UNAUTHORIZED -> "<html><body><h1>Not authorised</h1></body></html>";
                default -> "<html><body><h1>Unknown error</h1></body></html>";
            };
        }
        response.setEntity((resp, outputStream) -> {
            outputStream.write(message.getBytes(StandardCharsets.UTF_8));
            outputStream.flush();
        });
    }
}
