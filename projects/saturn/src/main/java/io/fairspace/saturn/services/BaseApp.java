package io.fairspace.saturn.services;

import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.fairspace.saturn.auth.AuthorizationResult;
import io.fairspace.saturn.auth.AuthorizationVerifier;
import io.fairspace.saturn.rdf.dao.DAOException;
import io.fairspace.saturn.util.UnsupportedMediaTypeException;
import lombok.extern.slf4j.Slf4j;
import spark.servlet.SparkApplication;

import static com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS;
import static io.fairspace.saturn.services.errors.ErrorHelper.errorBody;
import static io.fairspace.saturn.services.errors.ErrorHelper.exceptionHandler;
import static javax.servlet.http.HttpServletResponse.*;
import static org.apache.http.HttpStatus.SC_FORBIDDEN;
import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;
import static spark.Spark.*;

@Slf4j
public abstract class BaseApp implements SparkApplication {
    protected static final ObjectMapper mapper = new ObjectMapper()
            .registerModule(new IRIModule())
            .registerModule(new JavaTimeModule())
            .configure(WRITE_DATES_AS_TIMESTAMPS, false);

    private String pathSpec = "/*";
    private AuthorizationVerifier authorizationVerifier = null;

    @Override
    public void init() {
        if(authorizationVerifier != null) {
            before(pathSpec, (request, response) -> {
                // Verify authorization with the provided verifier
                AuthorizationResult authorizationResult = authorizationVerifier.verify(request);
                if (!authorizationResult.isAuthorized()) {
                    log.warn("Authorization failed {} {}", request.requestMethod(), request.uri());
                    response.type(APPLICATION_JSON.asString());
                    halt(SC_FORBIDDEN, errorBody(SC_FORBIDDEN, authorizationResult.getMessage()));
                }
            });
        }

        notFound((req, res) -> errorBody(SC_NOT_FOUND, "Not found"));
        exception(JsonMappingException.class, exceptionHandler(SC_BAD_REQUEST, "Invalid request body"));
        exception(IllegalArgumentException.class, exceptionHandler(SC_BAD_REQUEST, null));
        exception(DAOException.class, exceptionHandler(SC_BAD_REQUEST, "Bad request"));
        exception(UnsupportedMediaTypeException.class, exceptionHandler(SC_UNSUPPORTED_MEDIA_TYPE, null));
        exception(AccessDeniedException.class, exceptionHandler(SC_UNAUTHORIZED, null));
    }

    /**
     * Adds an authorization verifier to the current app
     * @param verifier
     * @return
     */
    public BaseApp withAuthorizationVerifier(String pathSpec, AuthorizationVerifier verifier) {
        this.pathSpec = pathSpec;
        authorizationVerifier = verifier;
        return this;
    }
}
