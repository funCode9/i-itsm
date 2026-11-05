package com.itsm.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ClassifyIncidentRequest {
    private Long categoryId;
    private Long serviceId;
    @Min(1) @Max(3) private int impact = 1;
    @Min(1) @Max(3) private int urgency = 1;
    @Min(1) @Max(3) private int businessCriticality = 1;
}
