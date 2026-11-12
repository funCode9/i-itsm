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
public class GeminiResolutionDTO {

    private Long incidentId;
    private String incidentNumber;
    private String title;
    private String category;
    private String service;
    private String priority;

    private String summary;
    private String rootCauseHypothesis;
    private List<ResolutionStep> steps;
    private Integer estimatedMinutes;
    private List<String> verificationChecklist;
    private String confidence; // HIGH, MEDIUM, LOW
    private String model;      // "gemini-2.0-flash", "gemini-1.5-flash", "heuristic-fallback"
    private boolean liveModel; // true if returned by real Gemini API
    private LocalDateTime generatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResolutionStep {
        private int stepNumber;
        private String title;
        private String command;
        private String description;
    }
}
