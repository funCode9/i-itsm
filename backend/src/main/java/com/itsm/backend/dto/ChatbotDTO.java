package com.itsm.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class ChatbotDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatMessage {
        private String role; // "user" or "assistant" / "model"
        private String content;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatRequest {
        private List<ChatMessage> history;
        private String message;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketDraft {
        private String title;
        private String description;
        private Long categoryId;
        private String categoryName;
        private Long serviceId;
        private String serviceName;
        private String impact; // LOW, MEDIUM, HIGH
        private String urgency; // LOW, MEDIUM, HIGH
        private String businessCriticality; // LOW, MEDIUM, HIGH, MISSION_CRITICAL
        private boolean readyToSubmit;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatResponse {
        private String reply;
        private TicketDraft ticketDraft;
        private boolean readyToSubmit;
        private String model;
        private boolean liveModel;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmitDraftRequest {
        private String title;
        private String description;
        private Long categoryId;
        private Long serviceId;
        private String impact;
        private String urgency;
        private String businessCriticality;
    }
}
