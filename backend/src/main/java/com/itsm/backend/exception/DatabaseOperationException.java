package com.itsm.backend.exception;

/**
 * Thrown when an underlying database query, transaction, or constraint integrity fails.
 * Corresponds to project specification: "Database failure".
 */
public class DatabaseOperationException extends RuntimeException {
    public DatabaseOperationException(String message) {
        super(message);
    }

    public DatabaseOperationException(String message, Throwable cause) {
        super(message, cause);
    }
}
