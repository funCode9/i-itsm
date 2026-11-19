package com.itsm.backend.exception;

/**
 * Thrown when an incident ID or incident state is corrupted, non-existent, or malformed.
 * Corresponds to project specification: "Invalid incident".
 */
public class InvalidIncidentException extends RuntimeException {
    public InvalidIncidentException(String message) {
        super(message);
    }

    public InvalidIncidentException(Long incidentId) {
        super("Invalid incident record: Incident with ID [" + incidentId + "] was not found or is malformed");
    }
}
