package io.fairspace.saturn.controller.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

import io.fairspace.saturn.services.PayloadParsingException;
import io.fairspace.saturn.services.errors.ErrorDto;
import io.fairspace.saturn.services.metadata.validation.ValidationException;

@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {

    //    // todo: add tests
    //    @ExceptionHandler(AccessDeniedException.class)
    //    public ResponseEntity<String> handleAccessDenied(AccessDeniedException ex) {
    //        return new ResponseEntity<>("Access Denied: " + ex.getMessage(), HttpStatus.FORBIDDEN);
    //    }

    @ExceptionHandler(PayloadParsingException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<ErrorDto> handlePayloadParsingException(PayloadParsingException ex, HttpServletRequest req) {
        log.error("Malformed request body for request {} {}", req.getMethod(), req.getRequestURI(), ex);
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Malformed request body");
    }

    @ExceptionHandler(ValidationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<ErrorDto> handleValidationException(ValidationException ex, HttpServletRequest req) {
        log.error("Validation error for request {} {}", req.getMethod(), req.getRequestURI(), ex);
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Validation Error", ex.getViolations());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<ErrorDto> handleIllegalArgumentException(
            IllegalArgumentException ex, HttpServletRequest req) {
        log.error("Validation error for request {} {}", req.getMethod(), req.getRequestURI(), ex);
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Validation Error", ex.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ResponseEntity<ErrorDto> handleAccessDeniedException(AccessDeniedException ex, HttpServletRequest req) {
        log.error("Access denied for request {} {}", req.getMethod(), req.getRequestURI(), ex);
        return buildErrorResponse(HttpStatus.FORBIDDEN, "Access Denied");
    }

    private ResponseEntity<ErrorDto> buildErrorResponse(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(new ErrorDto(status.value(), message, null));
    }

    private ResponseEntity<ErrorDto> buildErrorResponse(HttpStatus status, String message, Object info) {
        return ResponseEntity.status(status).body(new ErrorDto(status.value(), message, info));
    }
}
