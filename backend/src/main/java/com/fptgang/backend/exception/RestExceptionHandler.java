package com.fptgang.backend.exception;

import jdk.jfr.Description;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.Date;


@RestController
@ControllerAdvice
@Description("Handle all exceptions")
public class RestExceptionHandler extends ResponseEntityExceptionHandler {

    private static final HttpHeaders HEADERS = new HttpHeaders();

    static {
        HEADERS.setContentType(MediaType.APPLICATION_JSON);
    }

    private String extractMessage(Exception ex) {
        String message = ex.getMessage();
        int colonIndex = message.indexOf(':');
        return (colonIndex != -1) ? message.substring(colonIndex + 1).trim() : message;
    }

    @ExceptionHandler(InvalidInputException.class)
    public ResponseEntity<Object> handleBadRequestException(Exception ex, WebRequest request) {
        ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(),ex.getMessage(), new Date());
        return handleExceptionInternal(ex, error, HEADERS, HttpStatus.BAD_REQUEST, request);
    }
}
