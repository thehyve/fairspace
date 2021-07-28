package nl.fairspace.pluto.web;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@ControllerAdvice
public class ExtendedExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<Object> handleMultipartException(Exception ex, WebRequest request) {
        HttpStatus status = HttpStatus.PAYLOAD_TOO_LARGE;
        return handleExceptionInternal(ex, null, new HttpHeaders(), status, request);
    }
}
