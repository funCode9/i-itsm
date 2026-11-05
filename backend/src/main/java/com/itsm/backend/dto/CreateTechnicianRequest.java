package com.itsm.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class CreateTechnicianRequest {
    @NotNull private Long userId;
    private String specialization;
    private List<String> skills;
}
