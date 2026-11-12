package com.itsm.backend.service.intelligence;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.itsm.backend.domain.entity.Category;
import com.itsm.backend.domain.entity.Incident;
import com.itsm.backend.domain.entity.ItService;
import com.itsm.backend.domain.entity.User;
import com.itsm.backend.dto.ChatbotDTO;
import com.itsm.backend.repository.CategoryRepository;
import com.itsm.backend.repository.ItServiceRepository;
import com.itsm.backend.service.IncidentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiChatbotService {

    private final GeminiClient geminiClient;
    private final IncidentService incidentService;
    private final CategoryRepository categoryRepository;
    private final ItServiceRepository itServiceRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional(readOnly = true)
    public ChatbotDTO.ChatResponse chat(ChatbotDTO.ChatRequest request, User user) {
        List<Category> categories = categoryRepository.findAll();
        List<ItService> services = itServiceRepository.findAll();

        if (geminiClient.isConfigured()) {
            try {
                ChatbotDTO.ChatResponse response = callGeminiForChat(request, categories, services, user);
                if (response != null) {
                    return response;
                }
            } catch (Exception e) {
                log.warn("Gemini chatbot interaction failed: {}", e.getMessage());
            }
        }

        // Fallback Heuristic Conversational Engine
        return fallbackChat(request, categories, services, user);
    }

    @Transactional
    public Incident submitDraft(ChatbotDTO.SubmitDraftRequest request, User user) {
        int impact = parseSeverity(request.getImpact(), 2);
        int urgency = parseSeverity(request.getUrgency(), 2);
        int criticality = parseSeverity(request.getBusinessCriticality(), 2);

        return incidentService.createIncident(
                request.getTitle(),
                request.getDescription(),
                user.getId(),
                request.getCategoryId(),
                request.getServiceId(),
                impact,
                urgency,
                criticality
        );
    }

    private ChatbotDTO.ChatResponse callGeminiForChat(ChatbotDTO.ChatRequest request,
                                                      List<Category> categories,
                                                      List<ItService> services,
                                                      User user) throws Exception {
        String categoriesList = categories.stream()
                .map(c -> String.format("{id: %d, name: \"%s\"}", c.getId(), c.getName()))
                .collect(Collectors.joining(", "));

        String servicesList = services.stream()
                .map(s -> String.format("{id: %d, name: \"%s\", categoryId: %d}", s.getId(),
                        s.getName(), s.getCategory() != null ? s.getCategory().getId() : 0))
                .collect(Collectors.joining(", "));

        String systemInstruction = String.format("""
                You are I-ITSM Copilot, an enterprise IT service desk assistant helping %s report an incident.
                Available categories: [%s]
                Available services: [%s]
                Allowed Impact values: [LOW, MEDIUM, HIGH]
                Allowed Urgency values: [LOW, MEDIUM, HIGH]

                Instructions:
                1. Listen to the user's issue with empathy and professionalism.
                2. If the user's issue lacks details (what exactly failed, which system or software, how many users are affected), politely ask 1-2 clarifying questions.
                3. When you have sufficient understanding to describe the issue, produce a ticket draft matching the most appropriate Category ID and Service ID from the available lists. Set readyToSubmit: true.
                4. Always respond in strict JSON format matching this schema:
                {
                  "reply": "Conversational message addressed to the user",
                  "readyToSubmit": boolean,
                  "ticketDraft": {
                    "title": "Concise summary title",
                    "description": "Comprehensive explanation of what occurred",
                    "categoryId": 1,
                    "categoryName": "Category Name",
                    "serviceId": 1,
                    "serviceName": "Service Name",
                    "impact": "LOW" | "MEDIUM" | "HIGH",
                    "urgency": "LOW" | "MEDIUM" | "HIGH",
                    "businessCriticality": "MEDIUM"
                  }
                }
                If not ready to submit yet, ticketDraft can be null or partially filled with readyToSubmit = false.
                """, user.getFullName(), categoriesList, servicesList);

        Optional<String> jsonOpt = geminiClient.chatWithGemini(
                systemInstruction,
                request.getHistory(),
                request.getMessage()
        );

        if (jsonOpt.isEmpty()) {
            return null;
        }

        JsonNode root = objectMapper.readTree(jsonOpt.get());
        String reply = root.path("reply").asText("I have processed your request.");
        boolean readyToSubmit = root.path("readyToSubmit").asBoolean(false);

        ChatbotDTO.TicketDraft draft = null;
        JsonNode draftNode = root.path("ticketDraft");
        if (draftNode != null && !draftNode.isNull() && !draftNode.isEmpty()) {
            draft = ChatbotDTO.TicketDraft.builder()
                    .title(draftNode.path("title").asText("Reported IT Incident"))
                    .description(draftNode.path("description").asText(request.getMessage()))
                    .categoryId(draftNode.path("categoryId").asLong(1L))
                    .categoryName(draftNode.path("categoryName").asText("General IT"))
                    .serviceId(draftNode.path("serviceId").asLong(1L))
                    .serviceName(draftNode.path("serviceName").asText("IT Support"))
                    .impact(draftNode.path("impact").asText("MEDIUM"))
                    .urgency(draftNode.path("urgency").asText("MEDIUM"))
                    .businessCriticality(draftNode.path("businessCriticality").asText("MEDIUM"))
                    .readyToSubmit(readyToSubmit)
                    .build();
        }

        return ChatbotDTO.ChatResponse.builder()
                .reply(reply)
                .ticketDraft(draft)
                .readyToSubmit(readyToSubmit)
                .model("gemini-2.0-flash")
                .liveModel(true)
                .build();
    }

    private ChatbotDTO.ChatResponse fallbackChat(ChatbotDTO.ChatRequest request,
                                                  List<Category> categories,
                                                  List<ItService> services,
                                                  User user) {
        String msg = request.getMessage() != null ? request.getMessage() : "";
        String lower = msg.toLowerCase();

        // Detect category
        Category matchedCat = categories.stream()
                .filter(c -> c.getKeywords() != null && matchesKeywords(lower, c.getKeywords()))
                .findFirst()
                .orElse(categories.isEmpty() ? null : categories.get(0));

        // Detect service
        ItService matchedService = services.stream()
                .filter(s -> lower.contains(s.getName().toLowerCase()) ||
                        (matchedCat != null && s.getCategory() != null && s.getCategory().getId().equals(matchedCat.getId())))
                .findFirst()
                .orElse(services.isEmpty() ? null : services.get(0));

        // Impact & Urgency heuristics
        String impact = "MEDIUM";
        String urgency = "MEDIUM";
        if (lower.contains("urgent") || lower.contains("asap") || lower.contains("critical") || lower.contains("down") || lower.contains("entire")) {
            impact = "HIGH";
            urgency = "HIGH";
        } else if (lower.contains("minor") || lower.contains("question") || lower.contains("when possible")) {
            impact = "LOW";
            urgency = "LOW";
        }

        boolean hasContext = request.getHistory() != null && request.getHistory().size() >= 2;
        boolean detailedEnough = msg.length() > 20 || hasContext;

        if (!detailedEnough) {
            return ChatbotDTO.ChatResponse.builder()
                    .reply("Hello " + user.getFullName() + "! I'm your I-ITSM Copilot. Could you describe the issue in a bit more detail? For example: What system or device is affected, and is it completely preventing you from working?")
                    .readyToSubmit(false)
                    .ticketDraft(null)
                    .model("heuristic-engine")
                    .liveModel(false)
                    .build();
        }

        String draftTitle = msg.length() > 60 ? msg.substring(0, 57) + "..." : msg;
        if (!draftTitle.toLowerCase().contains("issue") && !draftTitle.toLowerCase().contains("problem")) {
            draftTitle = "Incident: " + draftTitle;
        }

        ChatbotDTO.TicketDraft draft = ChatbotDTO.TicketDraft.builder()
                .title(draftTitle)
                .description(msg)
                .categoryId(matchedCat != null ? matchedCat.getId() : 1L)
                .categoryName(matchedCat != null ? matchedCat.getName() : "General IT")
                .serviceId(matchedService != null ? matchedService.getId() : 1L)
                .serviceName(matchedService != null ? matchedService.getName() : "General Support")
                .impact(impact)
                .urgency(urgency)
                .businessCriticality("MEDIUM")
                .readyToSubmit(true)
                .build();

        return ChatbotDTO.ChatResponse.builder()
                .reply("Thanks for providing those details. I've prepared your incident ticket draft with category **"
                        + draft.getCategoryName() + "** and service **" + draft.getServiceName()
                        + "**. Review the ticket summary below and click **Submit Incident** when you're ready!")
                .ticketDraft(draft)
                .readyToSubmit(true)
                .model("heuristic-engine")
                .liveModel(false)
                .build();
    }

    private boolean matchesKeywords(String text, String keywords) {
        for (String kw : keywords.split(",")) {
            String trimmed = kw.trim().toLowerCase();
            if (!trimmed.isEmpty() && text.contains(trimmed)) {
                return true;
            }
        }
        return false;
    }

    private int parseSeverity(String val, int defaultVal) {
        if (val == null || val.isBlank()) return defaultVal;
        String upper = val.trim().toUpperCase();
        if (upper.contains("HIGH") || upper.contains("CRITICAL") || "3".equals(upper)) return 3;
        if (upper.contains("LOW") || "1".equals(upper)) return 1;
        return 2; // MEDIUM
    }
}
