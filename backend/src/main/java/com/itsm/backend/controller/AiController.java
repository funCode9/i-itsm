package com.itsm.backend.controller;

import com.itsm.backend.domain.entity.Incident;
import com.itsm.backend.domain.entity.User;
import com.itsm.backend.dto.AiConfigDTO;
import com.itsm.backend.dto.ChatbotDTO;
import com.itsm.backend.repository.UserRepository;
import com.itsm.backend.service.intelligence.GeminiChatbotService;
import com.itsm.backend.service.intelligence.GeminiClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final GeminiClient geminiClient;
    private final GeminiChatbotService chatbotService;
    private final UserRepository userRepository;

    @GetMapping("/status")
    public ResponseEntity<AiConfigDTO.StatusResponse> getStatus() {
        boolean configured = geminiClient.isConfigured();
        return ResponseEntity.ok(AiConfigDTO.StatusResponse.builder()
                .configured(configured)
                .maskedApiKey(geminiClient.getMaskedKey())
                .preferredModel(configured ? "gemini-2.0-flash" : "heuristic-engine")
                .status(configured ? "READY" : "NOT_CONFIGURED")
                .source(geminiClient.getKeySource())
                .build());
    }

    @PostMapping("/config/key")
    public ResponseEntity<AiConfigDTO.StatusResponse> setApiKey(@RequestBody AiConfigDTO.SetKeyRequest request) {
        if (request.getApiKey() != null) {
            geminiClient.saveApiKey(request.getApiKey());
        }
        return getStatus();
    }

    @PostMapping("/test")
    public ResponseEntity<AiConfigDTO.TestResponse> testConnection() {
        long start = System.currentTimeMillis();
        if (!geminiClient.isConfigured()) {
            return ResponseEntity.ok(AiConfigDTO.TestResponse.builder()
                    .success(false)
                    .modelUsed("none")
                    .latencyMs(0)
                    .message("Gemini API Key is not configured. Set GEMINI_API_KEY environment variable or save in settings.")
                    .sampleResponse(null)
                    .build());
        }

        try {
            Optional<String> res = geminiClient.generateJson(
                    "You are a system health probe. Respond with JSON: {\"status\": \"PONG\", \"message\": \"Gemini Live API is connected!\"}",
                    "ping"
            );

            long latency = System.currentTimeMillis() - start;
            if (res.isPresent()) {
                return ResponseEntity.ok(AiConfigDTO.TestResponse.builder()
                        .success(true)
                        .modelUsed("gemini-2.0-flash")
                        .latencyMs(latency)
                        .message("Connected to Google Gemini API successfully!")
                        .sampleResponse(res.get())
                        .build());
            } else {
                return ResponseEntity.ok(AiConfigDTO.TestResponse.builder()
                        .success(false)
                        .modelUsed("gemini-2.0-flash")
                        .latencyMs(latency)
                        .message("Gemini API call failed or returned empty payload.")
                        .sampleResponse(null)
                        .build());
            }
        } catch (Exception e) {
            long latency = System.currentTimeMillis() - start;
            return ResponseEntity.ok(AiConfigDTO.TestResponse.builder()
                    .success(false)
                    .modelUsed("gemini-2.0-flash")
                    .latencyMs(latency)
                    .message("Error connecting to Gemini: " + e.getMessage())
                    .sampleResponse(null)
                    .build());
        }
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatbotDTO.ChatResponse> chat(@RequestBody ChatbotDTO.ChatRequest request,
                                                        Authentication auth) {
        User user = getUser(auth);
        return ResponseEntity.ok(chatbotService.chat(request, user));
    }

    @PostMapping("/chat/submit")
    public ResponseEntity<Incident> submitDraftTicket(@RequestBody ChatbotDTO.SubmitDraftRequest request,
                                                      Authentication auth) {
        User user = getUser(auth);
        Incident incident = chatbotService.submitDraft(request, user);
        return ResponseEntity.ok(incident);
    }

    private User getUser(Authentication auth) {
        return userRepository.findByUsername(auth.getName()).orElseThrow();
    }
}
