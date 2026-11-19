package com.itsm.backend.exception;

/**
 * Thrown when business rules fail input validation (e.g. boundary violations, blank titles, negative values).
 * Corresponds to project specification: "Invalid user input".
 */
public class InvalidInputException extends RuntimeException {
    public InvalidInputException(String message) {
        super(message);
    }
}
