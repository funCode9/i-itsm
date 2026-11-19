package com.itsm.backend.exception;

/**
 * Thrown when an identical incident report has already been logged by the same user or for the same outage.
 * Corresponds to project specification: "Duplicate incident".
 */
public class DuplicateIncidentException extends RuntimeException {
    public DuplicateIncidentException(String message) {
        super(message);
    }

    public DuplicateIncidentException(String existingIncidentNumber, String title) {
        super("Potential duplicate incident detected: An active ticket [" + existingIncidentNumber + "] already covers: " + title);
    }
}
