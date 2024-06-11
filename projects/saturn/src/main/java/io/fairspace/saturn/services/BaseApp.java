package io.fairspace.saturn.services;

import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.log4j.*;
import spark.*;
import spark.servlet.SparkApplication;

import io.fairspace.saturn.rdf.dao.DAOException;
import io.fairspace.saturn.util.UnsupportedMediaTypeException;

import static io.fairspace.saturn.services.errors.ErrorHelper.errorBody;
import static io.fairspace.saturn.services.errors.ErrorHelper.exceptionHandler;

import static com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES;
import static com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS;
import static jakarta.servlet.http.HttpServletResponse.*;
import static spark.Spark.notFound;
import static spark.Spark.path;
import static spark.globalstate.ServletFlag.isRunningFromServlet;

@Log4j2
public abstract class BaseApp implements SparkApplication {
    protected static final ObjectMapper mapper = new ObjectMapper()
            .registerModule(new IRIModule())
            .registerModule(new JavaTimeModule())
            .configure(WRITE_DATES_AS_TIMESTAMPS, false)
            .configure(FAIL_ON_UNKNOWN_PROPERTIES, false);

    private final String basePath;

    protected BaseApp(String basePath) {
        this.basePath = basePath;
    }

    @Override
    public final void init() {
        path(basePath, () -> {
            notFound((req, res) -> {
                String pathInfo = req.pathInfo();
                if (pathInfo.startsWith("/api/webdav")
                        || pathInfo.startsWith("/api/extra-storage")
                        || pathInfo.startsWith("/api/rdf")) {
                    return null;
                }
                return errorBody(SC_NOT_FOUND, "Not found");
            });
            exception(JsonMappingException.class, exceptionHandler(SC_BAD_REQUEST, "Invalid request body"));
            exception(IllegalArgumentException.class, exceptionHandler(SC_BAD_REQUEST, null));
            exception(DAOException.class, exceptionHandler(SC_BAD_REQUEST, "Bad request"));
            exception(UnsupportedMediaTypeException.class, exceptionHandler(SC_UNSUPPORTED_MEDIA_TYPE, null));
            exception(AccessDeniedException.class, exceptionHandler(SC_FORBIDDEN, null));
            exception(Exception.class, exceptionHandler(SC_INTERNAL_SERVER_ERROR, "Internal server error"));
            exception(NotAvailableException.class, exceptionHandler(SC_SERVICE_UNAVAILABLE, null));
            exception(ConflictException.class, exceptionHandler(SC_CONFLICT, null));

            initApp();
        });
    }

    protected abstract void initApp();

    // A temporary workaround for https://github.com/perwendel/spark/issues/1062
    // Shadows spark.Spark.exception
    public static <T extends Exception> void exception(Class<T> exceptionClass, ExceptionHandler<? super T> handler) {
        if (isRunningFromServlet()) {
            var wrapper = new ExceptionHandlerImpl<>(exceptionClass) {
                @Override
                public void handle(T exception, Request request, Response response) {
                    handler.handle(exception, request, response);
                }
            };

            ExceptionMapper.getServletInstance().map(exceptionClass, wrapper);
        } else {
            Spark.exception(exceptionClass, handler);
        }
    }
}
