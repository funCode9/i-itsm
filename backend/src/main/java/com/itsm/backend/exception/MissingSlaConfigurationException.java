package com.itsm.backend.exception;

/**
 * Thrown when an incident is assigned but no matching SLA policy configuration exists for its priority.
 * Corresponds to project specification: "Missing SLA configuration".
 */
public class MissingSlaConfigurationException extends RuntimeException {
    public MissingSlaConfigurationException(String priority) {
        super("Missing SLA policy configuration: No response/resolution deadline rule found for priority [" + priority + "]");
    }

    public MissingSlaConfigurationException(String message, Throwable cause) {
        super(message, cause);
    }
}
