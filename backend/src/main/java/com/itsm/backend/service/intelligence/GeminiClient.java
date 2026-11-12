package com.itsm.backend.service.intelligence;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.itsm.backend.domain.entity.SystemConfig;
import com.itsm.backend.dto.ChatbotDTO;
import com.itsm.backend.repository.SystemConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class GeminiClient {

    private final SystemConfigRepository systemConfigRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String CONFIG_KEY = "GEMINI_API_KEY";
    private static final String GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/";
    private static final String PRIMARY_MODEL = "gemini-2.0-flash";
    private static final String FALLBACK_MODEL = "gemini-1.5-flash";

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    /**
     * Resolves the Gemini API Key from SystemConfig DB, or process environment variable, or JVM property.
     */
    public Optional<String> getApiKey() {
        // 1. Check database SystemConfig first
        Optional<SystemConfig> dbConfig = systemConfigRepository.findByConfigKey(CONFIG_KEY);
        if (dbConfig.isPresent() && dbConfig.get().getConfigValue() != null && !dbConfig.get().getConfigValue().isBlank()) {
            return Optional.of(dbConfig.get().getConfigValue().trim());
        }

        // 2. Check System Environment Variable
        String envKey = System.getenv("GEMINI_API_KEY");
        if (envKey != null && !envKey.isBlank()) {
            return Optional.of(envKey.trim());
        }

        // 3. Check JVM System Property
        String propKey = System.getProperty("gemini.api.key");
        if (propKey != null && !propKey.isBlank()) {
            return Optional.of(propKey.trim());
        }

        return Optional.empty();
    }

    public boolean isConfigured() {
        return getApiKey().isPresent();
    }

    public String getKeySource() {
        if (systemConfigRepository.findByConfigKey(CONFIG_KEY).filter(c -> c.getConfigValue() != null && !c.getConfigValue().isBlank()).isPresent()) {
            return "SYSTEM_CONFIG";
        }
        if (System.getenv("GEMINI_API_KEY") != null && !System.getenv("GEMINI_API_KEY").isBlank()) {
            return "ENVIRONMENT_VARIABLE";
        }
        return "NONE";
    }

    public String getMaskedKey() {
        return getApiKey().map(k -> {
            if (k.length() <= 8) return "****";
            return k.substring(0, 4) + "..." + k.substring(k.length() - 4);
        }).orElse("Not Configured");
    }

    public void saveApiKey(String key) {
        String trimmed = key != null ? key.trim() : "";
        SystemConfig config = systemConfigRepository.findByConfigKey(CONFIG_KEY)
                .orElse(SystemConfig.builder()
                        .configKey(CONFIG_KEY)
                        .description("Google Gemini API Key for AI features")
                        .build());
        config.setConfigValue(trimmed);
        systemConfigRepository.save(config);
        log.info("Persisted Gemini API Key to system_config (length: {})", trimmed.length());
    }

    /**
     * Sends prompt to Gemini requesting a JSON output with the primary model, falling back to 1.5-flash if needed.
     */
    public Optional<String> generateJson(String systemInstruction, String userPrompt) {
        Optional<String> keyOpt = getApiKey();
        if (keyOpt.isEmpty()) {
            log.debug("Gemini API key is not configured, skipping remote call");
            return Optional.empty();
        }

        String apiKey = keyOpt.get();

        // Try primary model first, then fallback
        for (String model : List.of(PRIMARY_MODEL, FALLBACK_MODEL)) {
            try {
                String response = callGemini(model, apiKey, systemInstruction, userPrompt, true);
                if (response != null && !response.isBlank()) {
                    return Optional.of(response);
                }
            } catch (Exception e) {
                log.warn("Failed calling Gemini model {}: {}", model, e.getMessage());
            }
        }
        return Optional.empty();
    }

    /**
     * Executes conversational prompt with message history.
     */
    public Optional<String> chatWithGemini(String systemInstruction,
                                          List<ChatbotDTO.ChatMessage> history,
                                          String latestUserMessage) {
        Optional<String> keyOpt = getApiKey();
        if (keyOpt.isEmpty()) {
            return Optional.empty();
        }

        String apiKey = keyOpt.get();
        for (String model : List.of(PRIMARY_MODEL, FALLBACK_MODEL)) {
            try {
                ObjectNode requestRoot = objectMapper.createObjectNode();

                // System instruction
                if (systemInstruction != null && !systemInstruction.isBlank()) {
                    ObjectNode systemNode = objectMapper.createObjectNode();
                    ArrayNode parts = objectMapper.createArrayNode();
                    parts.addObject().put("text", systemInstruction);
                    systemNode.set("parts", parts);
                    requestRoot.set("systemInstruction", systemNode);
                }

                // Contents array
                ArrayNode contents = objectMapper.createArrayNode();

                if (history != null) {
                    for (ChatbotDTO.ChatMessage msg : history) {
                        ObjectNode contentNode = objectMapper.createObjectNode();
                        String role = "user".equalsIgnoreCase(msg.getRole()) ? "user" : "model";
                        contentNode.put("role", role);
                        ArrayNode parts = objectMapper.createArrayNode();
                        parts.addObject().put("text", msg.getContent() != null ? msg.getContent() : "");
                        contentNode.set("parts", parts);
                        contents.add(contentNode);
                    }
                }

                // Append current user message
                ObjectNode latestUserNode = objectMapper.createObjectNode();
                latestUserNode.put("role", "user");
                ArrayNode userParts = objectMapper.createArrayNode();
                userParts.addObject().put("text", latestUserMessage);
                latestUserNode.set("parts", userParts);
                contents.add(latestUserNode);

                requestRoot.set("contents", contents);

                // Generation config
                ObjectNode genConfig = objectMapper.createObjectNode();
                genConfig.put("temperature", 0.4);
                genConfig.put("maxOutputTokens", 2048);
                genConfig.put("responseMimeType", "application/json");
                requestRoot.set("generationConfig", genConfig);

                String requestJson = objectMapper.writeValueAsString(requestRoot);

                String endpoint = GEMINI_BASE_URL + model + ":generateContent?key=" + apiKey;
                HttpRequest req = HttpRequest.newBuilder()
                        .uri(URI.create(endpoint))
                        .timeout(Duration.ofSeconds(15))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(requestJson))
                        .build();

                HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());

                if (resp.statusCode() >= 200 && resp.statusCode() < 300) {
                    String extracted = extractTextFromGeminiResponse(resp.body());
                    if (extracted != null && !extracted.isBlank()) {
                        return Optional.of(extracted);
                    }
                } else {
                    log.warn("Gemini chat responded with status {}: {}", resp.statusCode(), resp.body());
                }
            } catch (Exception e) {
                log.warn("Gemini chat model {} failed: {}", model, e.getMessage());
            }
        }
        return Optional.empty();
    }

    private String callGemini(String model, String apiKey, String systemInstruction, String userPrompt, boolean jsonMode) throws Exception {
        ObjectNode requestRoot = objectMapper.createObjectNode();

        if (systemInstruction != null && !systemInstruction.isBlank()) {
            ObjectNode systemNode = objectMapper.createObjectNode();
            ArrayNode parts = objectMapper.createArrayNode();
            parts.addObject().put("text", systemInstruction);
            systemNode.set("parts", parts);
            requestRoot.set("systemInstruction", systemNode);
        }

        ArrayNode contents = objectMapper.createArrayNode();
        ObjectNode userNode = objectMapper.createObjectNode();
        userNode.put("role", "user");
        ArrayNode parts = objectMapper.createArrayNode();
        parts.addObject().put("text", userPrompt);
        userNode.set("parts", parts);
        contents.add(userNode);
        requestRoot.set("contents", contents);

        ObjectNode genConfig = objectMapper.createObjectNode();
        genConfig.put("temperature", 0.2);
        genConfig.put("maxOutputTokens", 2048);
        if (jsonMode) {
            genConfig.put("responseMimeType", "application/json");
        }
        requestRoot.set("generationConfig", genConfig);

        String requestJson = objectMapper.writeValueAsString(requestRoot);
        String endpoint = GEMINI_BASE_URL + model + ":generateContent?key=" + apiKey;

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .timeout(Duration.ofSeconds(15))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestJson))
                .build();

        HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());

        if (resp.statusCode() >= 200 && resp.statusCode() < 300) {
            return extractTextFromGeminiResponse(resp.body());
        } else {
            throw new RuntimeException("Gemini HTTP " + resp.statusCode() + ": " + resp.body());
        }
    }

    private String extractTextFromGeminiResponse(String responseJson) {
        try {
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    return parts.get(0).path("text").asText();
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse Gemini candidate output: {}", e.getMessage());
        }
        return null;
    }
}
