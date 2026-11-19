package com.itsm.backend.exception;

/**
 * Thrown when an assignment would exceed a technician's maximum concurrent workload capacity.
 * Corresponds to project specification: "Technician workload exceeded".
 */
public class TechnicianWorkloadExceededException extends RuntimeException {
    public TechnicianWorkloadExceededException(String message) {
        super(message);
    }

    public TechnicianWorkloadExceededException(String technicianName, long currentTickets, int maxCapacity) {
        super("Technician " + technicianName + " active workload threshold reached: "
                + currentTickets + " active tickets (maximum capacity: " + maxCapacity + ")");
    }
}
