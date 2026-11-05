package com.itsm.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateIncidentRequest {
    @NotBlank @Size(max = 200)
    private String title;
    @NotBlank @Size(max = 5000)
    private String description;
    private Long categoryId;
    private Long serviceId;
    @Min(1) @Max(3)
    private int impact = 1;
    @Min(1) @Max(3)
    private int urgency = 1;
    @Min(1) @Max(3)
    private int businessCriticality = 1;
}
