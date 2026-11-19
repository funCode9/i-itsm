package com.itsm.backend.exception;

/**
 * Thrown when an authenticated user attempts an operation outside their authorized role.
 * Corresponds to project specification: "Unauthorized operation".
 */
public class UnauthorizedOperationException extends AccessDeniedException {
    public UnauthorizedOperationException(String message) {
        super(message);
    }

    public UnauthorizedOperationException(String operation, String requiredRole) {
        super("Unauthorized operation [" + operation + "]: Action requires [" + requiredRole + "] privileges");
    }
}
