package io.fairspace.saturn.services.errors;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import spark.Response;

import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;

public class ErrorHelper {
    private static final ObjectMapper mapper = new ObjectMapper();

    public static void returnError(Response response, int status, String message) {
        response.status(status);
        response.type(APPLICATION_JSON.asString());
        response.body(errorBody(status, message));
    }

    public static String errorBody(int status, String message) {
        try {
            return mapper.writeValueAsString(new ErrorDto(status, message));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e); // Should never happen
        }
    }
}
