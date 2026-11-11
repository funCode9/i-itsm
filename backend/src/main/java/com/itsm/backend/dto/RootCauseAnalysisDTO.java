package com.itsm.backend.dto;

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
public class RootCauseAnalysisDTO {
    private Long incidentId;
    private String incidentNumber;
    private String title;
    private String categoryName;
    private String serviceName;

    private String domainClassification;
    private String probableRootCause;
    private int confidenceScore; // 0 - 100%
    private List<String> evidenceKeywords;
    private List<String> remediationSteps;
    private List<String> preventiveRecommendations;
    private String recommendedWorkaround;
    private int correlatedIncidentCount;
    private String correlationSummary;

    private LocalDateTime analyzedAt;
}
