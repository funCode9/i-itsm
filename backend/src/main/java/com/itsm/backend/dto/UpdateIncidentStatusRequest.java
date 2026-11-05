package com.itsm.backend.dto;

import com.itsm.backend.domain.enums.IncidentStatus;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateIncidentStatusRequest {
    private IncidentStatus newStatus;
    @Size(max = 5000)
    private String resolutionDetails;
    @Size(max = 2000)
    private String closureNotes;
}
