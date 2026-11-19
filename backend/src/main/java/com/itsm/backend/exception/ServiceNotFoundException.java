package com.itsm.backend.exception;

/**
 * Thrown when an IT Service is requested or referenced by an incident but does not exist in catalog.
 * Corresponds to project specification: "Service not found".
 */
public class ServiceNotFoundException extends ResourceNotFoundException {
    public ServiceNotFoundException(Long serviceId) {
        super("IT Service", serviceId);
    }

    public ServiceNotFoundException(String message) {
        super(message);
    }
}
