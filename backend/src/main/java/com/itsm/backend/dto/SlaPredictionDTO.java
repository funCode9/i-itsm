package com.itsm.backend.dto;

import com.itsm.backend.domain.enums.IncidentStatus;
import com.itsm.backend.domain.enums.Priority;
import com.itsm.backend.domain.enums.SlaStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SlaPredictionDTO {
    private Long incidentId;
    private String incidentNumber;
    private String title;
    private Priority priority;
    private IncidentStatus status;
    private String assignedTechnicianName;

    private LocalDateTime resolutionDeadline;
    private long totalWindowMinutes;
    private long elapsedMinutes;
    private long remainingMinutes;
    private double elapsedPercentage;

    private int riskScore; // 0 - 100
    private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL
    private SlaStatus currentSlaStatus;
    private boolean isBreached;

    private List<String> riskFactors;
    private String recommendedAction;
}
