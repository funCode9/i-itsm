package com.itsm.backend.exception;

import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Centralized exception handling for the entire application.
 *
 * Catches all domain and infrastructure exceptions specified in CS F213 Project Requirements:
 * - Invalid login
 * - Unauthorized operation
 * - Invalid incident
 * - Invalid state transition
 * - Technician unavailable
 * - Technician workload exceeded
 * - Service not found
 * - Missing SLA configuration
 * - Duplicate incident
 * - Database failure
 * - Invalid user input
 *
 * OOP Principles:
 * - Polymorphism: Handled through overloaded @ExceptionHandler methods dispatching by runtime exception type.
 * - Abstraction: Encapsulates internal stack traces and provides clean, structured API error contracts.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
        return buildError(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", ex.getMessage());
    }

    @ExceptionHandler(InvalidIncidentException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidIncident(InvalidIncidentException ex) {
        return buildError(HttpStatus.NOT_FOUND, "INVALID_INCIDENT", ex.getMessage());
    }

    @ExceptionHandler(ServiceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleServiceNotFound(ServiceNotFoundException ex) {
        return buildError(HttpStatus.NOT_FOUND, "SERVICE_NOT_FOUND", ex.getMessage());
    }

    @ExceptionHandler(InvalidStateTransitionException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidTransition(InvalidStateTransitionException ex) {
        return buildError(HttpStatus.BAD_REQUEST, "INVALID_STATE_TRANSITION", ex.getMessage());
    }

    @ExceptionHandler(TechnicianUnavailableException.class)
    public ResponseEntity<Map<String, Object>> handleTechUnavailable(TechnicianUnavailableException ex) {
        return buildError(HttpStatus.CONFLICT, "TECHNICIAN_UNAVAILABLE", ex.getMessage());
    }

    @ExceptionHandler(TechnicianWorkloadExceededException.class)
    public ResponseEntity<Map<String, Object>> handleTechOverloaded(TechnicianWorkloadExceededException ex) {
        return buildError(HttpStatus.CONFLICT, "TECHNICIAN_WORKLOAD_EXCEEDED", ex.getMessage());
    }

    @ExceptionHandler(MissingSlaConfigurationException.class)
    public ResponseEntity<Map<String, Object>> handleMissingSla(MissingSlaConfigurationException ex) {
        return buildError(HttpStatus.UNPROCESSABLE_ENTITY, "MISSING_SLA_CONFIG", ex.getMessage());
    }

    @ExceptionHandler(DuplicateIncidentException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicateIncident(DuplicateIncidentException ex) {
        return buildError(HttpStatus.CONFLICT, "DUPLICATE_INCIDENT", ex.getMessage());
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicate(DuplicateResourceException ex) {
        return buildError(HttpStatus.CONFLICT, "DUPLICATE_RESOURCE", ex.getMessage());
    }

    @ExceptionHandler({AccessDeniedException.class, UnauthorizedOperationException.class})
    public ResponseEntity<Map<String, Object>> handleAccessDenied(RuntimeException ex) {
        return buildError(HttpStatus.FORBIDDEN, "UNAUTHORIZED_OPERATION", ex.getMessage());
    }

    @ExceptionHandler({AuthenticationException.class, BadCredentialsException.class})
    public ResponseEntity<Map<String, Object>> handleAuthException(AuthenticationException ex) {
        return buildError(HttpStatus.UNAUTHORIZED, "INVALID_LOGIN", "Invalid username or password credentials supplied");
    }

    @ExceptionHandler({InvalidInputException.class, IllegalArgumentException.class})
    public ResponseEntity<Map<String, Object>> handleInvalidInput(RuntimeException ex) {
        return buildError(HttpStatus.BAD_REQUEST, "INVALID_USER_INPUT", ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return buildError(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", errors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(ConstraintViolationException ex) {
        return buildError(HttpStatus.BAD_REQUEST, "CONSTRAINT_VIOLATION", ex.getMessage());
    }

    @ExceptionHandler({DataAccessException.class, DatabaseOperationException.class})
    public ResponseEntity<Map<String, Object>> handleDatabaseFailure(Exception ex) {
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR, "DATABASE_FAILURE",
                "Database operation failed: Unable to commit transaction or integrity constraint violated");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR",
                "An unexpected server error occurred: " + ex.getMessage());
    }

    private ResponseEntity<Map<String, Object>> buildError(HttpStatus status, String code, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("code", code);
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }
}
