package com.itsm.backend;

import com.itsm.backend.domain.entity.Category;
import com.itsm.backend.domain.entity.Incident;
import com.itsm.backend.domain.entity.ItService;
import com.itsm.backend.domain.entity.User;
import com.itsm.backend.domain.enums.Priority;
import com.itsm.backend.dto.ChatbotDTO;
import com.itsm.backend.dto.GeminiResolutionDTO;
import com.itsm.backend.repository.CategoryRepository;
import com.itsm.backend.repository.IncidentRepository;
import com.itsm.backend.repository.ItServiceRepository;
import com.itsm.backend.repository.SystemConfigRepository;
import com.itsm.backend.service.IncidentNoteService;
import com.itsm.backend.service.IncidentService;
import com.itsm.backend.service.intelligence.GeminiChatbotService;
import com.itsm.backend.service.intelligence.GeminiClient;
import com.itsm.backend.service.intelligence.GeminiResolutionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("Intelligent Features - Gemini AI Resolution & Conversational Chatbot Tests")
class GeminiAiFeaturesTest {

    @Mock
    private IncidentRepository incidentRepository;
    @Mock
    private GeminiClient geminiClient;
    @Mock
    private IncidentNoteService noteService;
    @Mock
    private IncidentService incidentService;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private ItServiceRepository itServiceRepository;
    @Mock
    private SystemConfigRepository systemConfigRepository;

    @InjectMocks
    private GeminiResolutionService resolutionService;

    @InjectMocks
    private GeminiChatbotService chatbotService;

    private Incident sampleIncident;
    private Category networkCat;
    private ItService wifiService;
    private User employeeUser;

    @BeforeEach
    void setUp() {
        networkCat = Category.builder().id(1L).name("Network").keywords("wifi,router,dns,ip,vpn").build();
        wifiService = ItService.builder().id(10L).name("Corporate WiFi").category(networkCat).build();
        employeeUser = User.builder().id(5L).username("emp1").fullName("Jane Doe").build();

        sampleIncident = Incident.builder()
                .id(100L)
                .incidentNumber("INC-20261112-9999")
                .title("Cannot connect to 5th floor office WiFi")
                .description("WiFi keeps dropping IP lease and fails to resolve DNS")
                .category(networkCat)
                .service(wifiService)
                .priority(Priority.P2_HIGH)
                .impact(2)
                .urgency(3)
                .businessCriticality(2)
                .build();
    }

    @Test
    @DisplayName("Should generate resolution playbook using intelligent fallback when Gemini key not configured")
    void testResolutionRecommendationFallback() {
        when(incidentRepository.findById(100L)).thenReturn(Optional.of(sampleIncident));
        when(geminiClient.isConfigured()).thenReturn(false);

        GeminiResolutionDTO result = resolutionService.generateRecommendation(100L);

        assertThat(result).isNotNull();
        assertThat(result.getIncidentNumber()).isEqualTo("INC-20261112-9999");
        assertThat(result.getSteps()).isNotEmpty();
        assertThat(result.getSteps().get(0).getTitle()).contains("DNS");
        assertThat(result.getVerificationChecklist()).isNotEmpty();
        assertThat(result.isLiveModel()).isFalse();
        assertThat(result.getModel()).isEqualTo("heuristic-rule-engine");
    }

    @Test
    @DisplayName("Should generate resolution playbook using live Gemini client response when configured")
    void testResolutionRecommendationLiveGemini() {
        when(incidentRepository.findById(100L)).thenReturn(Optional.of(sampleIncident));
        when(geminiClient.isConfigured()).thenReturn(true);

        String mockGeminiJson = """
                {
                  "summary": "Wireless access point 802.1x handshake timing out.",
                  "rootCauseHypothesis": "Radius authentication server certificate expired.",
                  "estimatedMinutes": 15,
                  "confidence": "HIGH",
                  "steps": [
                    { "stepNumber": 1, "title": "Inspect RADIUS Server Logs", "command": "journalctl -u freeradius -n 50", "description": "Check TLS handshake errors" }
                  ],
                  "verificationChecklist": ["Verify client connects to SSID with WPA3-Enterprise"]
                }
                """;

        when(geminiClient.generateJson(any(), any())).thenReturn(Optional.of(mockGeminiJson));

        GeminiResolutionDTO result = resolutionService.generateRecommendation(100L);

        assertThat(result).isNotNull();
        assertThat(result.isLiveModel()).isTrue();
        assertThat(result.getModel()).isEqualTo("gemini-2.0-flash");
        assertThat(result.getRootCauseHypothesis()).contains("Radius authentication");
        assertThat(result.getSteps()).hasSize(1);
        assertThat(result.getSteps().get(0).getCommand()).isEqualTo("journalctl -u freeradius -n 50");
    }

    @Test
    @DisplayName("Chatbot should interact conversationally and draft incident ticket")
    void testChatbotConversationAndDrafting() {
        when(categoryRepository.findAll()).thenReturn(List.of(networkCat));
        when(itServiceRepository.findAll()).thenReturn(List.of(wifiService));
        when(geminiClient.isConfigured()).thenReturn(false);

        ChatbotDTO.ChatRequest req = ChatbotDTO.ChatRequest.builder()
                .message("My corporate wifi keeps disconnecting every 5 minutes in the conference room")
                .history(List.of())
                .build();

        ChatbotDTO.ChatResponse res = chatbotService.chat(req, employeeUser);

        assertThat(res).isNotNull();
        assertThat(res.isReadyToSubmit()).isTrue();
        assertThat(res.getTicketDraft()).isNotNull();
        assertThat(res.getTicketDraft().getCategoryName()).isEqualTo("Network");
        assertThat(res.getTicketDraft().getServiceName()).isEqualTo("Corporate WiFi");
    }
}
