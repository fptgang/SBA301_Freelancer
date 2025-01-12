package com.fptgang.backend.exception;

import com.fptgang.backend.dto.ErrorResponse;
import jdk.jfr.Description;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
@Description("Handle all exceptions")
public class RestExceptionHandler extends ResponseEntityExceptionHandler {

    private static final HttpHeaders HEADERS = new HttpHeaders();

    static {
        HEADERS.setContentType(MediaType.APPLICATION_JSON);
    }

    @ExceptionHandler(InvalidInputException.class)
    public ResponseEntity<Object> handleBadRequestException(Exception ex, WebRequest request) {
        ErrorResponse error = new ErrorResponse().error(ex.getMessage());
        return handleExceptionInternal(ex, error, HEADERS, HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGeneralException(Exception ex, WebRequest request) {
        HttpStatusCode status = HttpStatus.INTERNAL_SERVER_ERROR;

        if (ex instanceof org.springframework.security.access.AccessDeniedException) {
            status = HttpStatus.UNAUTHORIZED;
        } else if (ex instanceof org.springframework.web.server.ResponseStatusException) {
            status = ((org.springframework.web.server.ResponseStatusException) ex).getStatusCode();
        } else if (ex instanceof org.springframework.web.bind.MissingServletRequestParameterException) {
            status = HttpStatus.BAD_REQUEST;
        }

        ErrorResponse error = new ErrorResponse().error(ex.getMessage());
        return ResponseEntity.status(status).body(error);
    }
}
