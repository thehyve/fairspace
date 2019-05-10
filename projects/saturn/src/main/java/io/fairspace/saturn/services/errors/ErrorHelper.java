package io.fairspace.saturn.services.errors;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import spark.ExceptionHandler;

import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;

@Slf4j
public class ErrorHelper {
    private static final ObjectMapper mapper = new ObjectMapper();

    public static <T extends Exception> ExceptionHandler<T> exceptionHandler(int status, String message) {
        return (e, req, res) -> {
            log.error("{} Error handling request {} {}", status, req.requestMethod(), req.uri(), e);
            res.status(status);
            res.type(APPLICATION_JSON.asString());
            res.body(errorBody(status, message != null ? message : e.getMessage()));
        };
    }

    public static String errorBody(int status, String message) {
        return errorBody(status, message, null);
    }

    @SneakyThrows(JsonProcessingException.class)
    public static String errorBody(int status, String message, Object info) {
        return mapper.writeValueAsString(new ErrorDto(status, message, info));
    }
}
