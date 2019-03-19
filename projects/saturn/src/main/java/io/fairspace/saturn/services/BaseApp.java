package io.fairspace.saturn.services;

import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.fairspace.saturn.rdf.dao.DAOException;
import io.fairspace.saturn.util.UnsupportedMediaTypeException;
import spark.servlet.SparkApplication;

import static com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS;
import static io.fairspace.saturn.services.errors.ErrorHelper.errorBody;
import static io.fairspace.saturn.services.errors.ErrorHelper.exceptionHandler;
import static javax.servlet.http.HttpServletResponse.*;
import static spark.Spark.exception;
import static spark.Spark.notFound;

public abstract class BaseApp implements SparkApplication {
    protected static final ObjectMapper mapper = new ObjectMapper()
            .registerModule(new IRIModule())
            .registerModule(new JavaTimeModule())
            .configure(WRITE_DATES_AS_TIMESTAMPS, false);

    @Override
    public void init() {
        notFound((req, res) -> errorBody(SC_NOT_FOUND, "Not found"));
        exception(JsonMappingException.class, exceptionHandler(SC_BAD_REQUEST, "Invalid request body"));
        exception(IllegalArgumentException.class, exceptionHandler(SC_BAD_REQUEST, null));
        exception(DAOException.class, exceptionHandler(SC_BAD_REQUEST, "Bad request"));
        exception(UnsupportedMediaTypeException.class, exceptionHandler(SC_UNSUPPORTED_MEDIA_TYPE, null));
    }
}
