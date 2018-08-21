package io.fairspace.neptune.web;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.net.ConnectException;

@Slf4j
@ControllerAdvice
@ResponseBody
public class RestResponseEntityExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(HttpServerErrorException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    protected ErrorBody handleServerException(HttpServerErrorException ex, WebRequest request) {
        ErrorBody errorBody = new ErrorBody("Could not talk to storage backend");
        log.debug(request.toString());
        log.error("A http server error exception occurred. This is most probably caused by an error in the storage backend itself. Please check its logs.", ex);
        return errorBody;
    }

    @ExceptionHandler(HttpClientErrorException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    protected ErrorBody handleHttpclientException(HttpClientErrorException ex, WebRequest request) {
        ErrorBody errorBody = new ErrorBody("Someone, or something, did not answer the phone.");
        log.debug(request.toString());
        log.error("A client error exception occurred. This is most probably caused by Neptune sending an improper request to the storage backend or a misconfiguration of Neptune.", ex);
        return errorBody;
    }

    @ExceptionHandler(ConnectException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    protected ErrorBody handleConnectException(ConnectException ex) {
        ErrorBody errorBody = new ErrorBody("Could not reach storage backend");
        log.error("Connect exception occurred. This is most probably caused by a misconfiguration of the metadata storage backend.", ex);
        return errorBody;
    }

    @ExceptionHandler(CollectionNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    protected ErrorBody handleNotFoundException(CollectionNotFoundException ex) {
        return new ErrorBody("Collection could not be found");
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    protected ErrorBody handleGenericException(Exception ex) {
        ErrorBody errorBody = new ErrorBody("An internal error occurred.");
        log.error("An unexpected error occurred.", ex);
        return errorBody;
    }


}
