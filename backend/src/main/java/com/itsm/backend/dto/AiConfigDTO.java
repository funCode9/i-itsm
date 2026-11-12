package com.itsm.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AiConfigDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusResponse {
        private boolean configured;
        private String maskedApiKey;
        private String preferredModel;
        private String status; // "READY", "NOT_CONFIGURED"
        private String source; // "SYSTEM_CONFIG", "ENVIRONMENT_VARIABLE", "NONE"
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SetKeyRequest {
        private String apiKey;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestResponse {
        private boolean success;
        private String modelUsed;
        private long latencyMs;
        private String message;
        private String sampleResponse;
    }
}
