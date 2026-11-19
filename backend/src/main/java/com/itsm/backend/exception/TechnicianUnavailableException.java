package com.itsm.backend.exception;

/**
 * Thrown when an assignment is attempted to an inactive, unavailable, or off-duty technician.
 * Corresponds to project specification: "Technician unavailable".
 */
public class TechnicianUnavailableException extends RuntimeException {
    public TechnicianUnavailableException(String message) {
        super(message);
    }

    public TechnicianUnavailableException(Long technicianId, String name) {
        super("Technician " + name + " (ID: " + technicianId + ") is currently unavailable or off-duty");
    }
}
