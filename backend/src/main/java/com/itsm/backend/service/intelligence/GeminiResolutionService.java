package com.itsm.backend.service.intelligence;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.itsm.backend.domain.entity.Incident;
import com.itsm.backend.domain.entity.IncidentNote;
import com.itsm.backend.domain.enums.NoteType;
import com.itsm.backend.dto.GeminiResolutionDTO;
import com.itsm.backend.exception.ResourceNotFoundException;
import com.itsm.backend.repository.IncidentRepository;
import com.itsm.backend.service.IncidentNoteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiResolutionService {

    private final IncidentRepository incidentRepository;
    private final GeminiClient geminiClient;
    private final IncidentNoteService noteService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional(readOnly = true)
    public GeminiResolutionDTO generateRecommendation(Long incidentId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: " + incidentId));

        String categoryName = incident.getCategory() != null ? incident.getCategory().getName() : "General IT";
        String serviceName = incident.getService() != null ? incident.getService().getName() : "Unassigned Service";

        // Try Live Gemini first
        if (geminiClient.isConfigured()) {
            try {
                GeminiResolutionDTO liveDto = callGeminiForResolution(incident, categoryName, serviceName);
                if (liveDto != null) {
                    return liveDto;
                }
            } catch (Exception e) {
                log.warn("Gemini resolution generation failed for incident {}: {}", incident.getIncidentNumber(), e.getMessage());
            }
        }

        // Fallback to Intelligent ITIL Heuristic Playbook
        return buildHeuristicRecommendation(incident, categoryName, serviceName);
    }

    @Transactional
    public IncidentNote applyRecommendationAsNote(Long incidentId, Long userId) {
        GeminiResolutionDTO dto = generateRecommendation(incidentId);

        StringBuilder sb = new StringBuilder();
        sb.append("🤖 [AI Resolution Playbook - ").append(dto.isLiveModel() ? "Live Gemini Model" : "Simulated Rule Engine").append("]\n\n");
        sb.append("📌 Root Cause Hypothesis: ").append(dto.getRootCauseHypothesis()).append("\n");
        sb.append("⏱️ Estimated Time to Resolve: ").append(dto.getEstimatedMinutes()).append(" minutes\n\n");
        sb.append("Remediation Steps:\n");

        if (dto.getSteps() != null) {
            for (GeminiResolutionDTO.ResolutionStep step : dto.getSteps()) {
                sb.append(step.getStepNumber()).append(". ").append(step.getTitle()).append("\n");
                if (step.getCommand() != null && !step.getCommand().isBlank()) {
                    sb.append("   Command: `").append(step.getCommand()).append("`\n");
                }
                sb.append("   Action: ").append(step.getDescription()).append("\n");
            }
        }

        if (dto.getVerificationChecklist() != null && !dto.getVerificationChecklist().isEmpty()) {
            sb.append("\nVerification Checklist:\n");
            for (String chk : dto.getVerificationChecklist()) {
                sb.append("- [ ] ").append(chk).append("\n");
            }
        }

        return noteService.addNote(incidentId, userId, sb.toString(), NoteType.INVESTIGATION, false);
    }

    private GeminiResolutionDTO callGeminiForResolution(Incident incident, String category, String service) throws Exception {
        String systemInstruction = """
                You are an elite ITIL-certified Senior Systems Reliability and IT Operations Engineer.
                Analyze the incident report provided by the user and produce a step-by-step remediation guide in strict JSON format.
                Provide concrete terminal commands, configuration steps, diagnostic checks, and a clear verification checklist.
                JSON structure:
                {
                  "summary": "Short 1-2 sentence diagnostic overview",
                  "rootCauseHypothesis": "Direct technical root cause",
                  "estimatedMinutes": 25,
                  "confidence": "HIGH" | "MEDIUM",
                  "steps": [
                    {
                      "stepNumber": 1,
                      "title": "Short title",
                      "command": "Executable CLI command or empty string",
                      "description": "Specific action to take"
                    }
                  ],
                  "verificationChecklist": [
                    "Check step 1",
                    "Check step 2"
                  ]
                }
                """;

        String userPrompt = String.format("""
                Incident Ticket Details:
                - Incident Number: %s
                - Title: %s
                - Description: %s
                - Category: %s
                - Affected IT Service: %s
                - Priority: %s
                - Impact: %s, Urgency: %s
                """,
                incident.getIncidentNumber(),
                incident.getTitle(),
                incident.getDescription(),
                category,
                service,
                incident.getPriority(),
                incident.getImpact(),
                incident.getUrgency());

        Optional<String> jsonOpt = geminiClient.generateJson(systemInstruction, userPrompt);
        if (jsonOpt.isEmpty()) {
            return null;
        }

        JsonNode root = objectMapper.readTree(jsonOpt.get());
        List<GeminiResolutionDTO.ResolutionStep> steps = new ArrayList<>();
        JsonNode stepsNode = root.path("steps");
        if (stepsNode.isArray()) {
            int idx = 1;
            for (JsonNode sn : stepsNode) {
                steps.add(GeminiResolutionDTO.ResolutionStep.builder()
                        .stepNumber(sn.path("stepNumber").asInt(idx++))
                        .title(sn.path("title").asText("Action Step"))
                        .command(sn.path("command").asText(""))
                        .description(sn.path("description").asText(""))
                        .build());
            }
        }

        List<String> checklist = new ArrayList<>();
        JsonNode chkNode = root.path("verificationChecklist");
        if (chkNode.isArray()) {
            for (JsonNode c : chkNode) {
                checklist.add(c.asText());
            }
        }

        return GeminiResolutionDTO.builder()
                .incidentId(incident.getId())
                .incidentNumber(incident.getIncidentNumber())
                .title(incident.getTitle())
                .category(category)
                .service(service)
                .priority(incident.getPriority() != null ? incident.getPriority().name() : "P3_MEDIUM")
                .summary(root.path("summary").asText("Automated remediation analysis completed."))
                .rootCauseHypothesis(root.path("rootCauseHypothesis").asText("System anomaly or configuration drift detected."))
                .steps(steps)
                .estimatedMinutes(root.path("estimatedMinutes").asInt(30))
                .verificationChecklist(checklist)
                .confidence(root.path("confidence").asText("HIGH"))
                .model("gemini-2.0-flash")
                .liveModel(true)
                .generatedAt(LocalDateTime.now())
                .build();
    }

    private GeminiResolutionDTO buildHeuristicRecommendation(Incident incident, String category, String service) {
        String catLower = category.toLowerCase();
        String titleLower = (incident.getTitle() + " " + incident.getDescription()).toLowerCase();

        List<GeminiResolutionDTO.ResolutionStep> steps = new ArrayList<>();
        List<String> checklist = new ArrayList<>();
        String rootCause;
        String summary;
        int estMinutes = 20;

        if (catLower.contains("network") || titleLower.contains("wifi") || titleLower.contains("vpn")) {
            summary = "Network packet drop or authentication handshake timeout detected on the interface gateway.";
            rootCause = "DHCP lease exhaustion or DNS resolution failure on client network adapter.";
            estMinutes = 15;
            steps.add(GeminiResolutionDTO.ResolutionStep.builder()
                    .stepNumber(1)
                    .title("Flush DNS & Renew DHCP Lease")
                    .command("ipconfig /flushdns && ipconfig /renew")
                    .description("Clear cached host records and re-request IP from corporate DHCP pool.")
                    .build());
            steps.add(GeminiResolutionDTO.ResolutionStep.builder()
                    .stepNumber(2)
                    .title("Validate Gateway & Subnet Ping")
                    .command("ping 10.0.0.1 -n 4 && tracert 8.8.8.8")
                    .description("Confirm local gateway ICMP responsiveness and inspect intermediate hop latency.")
                    .build());
            steps.add(GeminiResolutionDTO.ResolutionStep.builder()
                    .stepNumber(3)
                    .title("Restart Network Interface Adapter")
                    .command("netsh interface set interface \"Wi-Fi\" admin=disable && netsh interface set interface \"Wi-Fi\" admin=enable")
                    .description("Perform clean hardware cycle on 802.11ax wireless controller.")
                    .build());
            checklist.add("Verify active IP assignment within 10.x.x.x subnet");
            checklist.add("Confirm zero packet loss to internal intranet portal");
            checklist.add("Verify VPN client connects with certificate validation");
        } else if (catLower.contains("database") || titleLower.contains("sql") || titleLower.contains("db")) {
            summary = "Database connection pool starvation or deadlocked transaction blocking queries.";
            rootCause = "HikariCP thread pool exhaustion or long-running unindexed query locks.";
            estMinutes = 25;
            steps.add(GeminiResolutionDTO.ResolutionStep.builder()
                    .stepNumber(1)
                    .title("Inspect Active PostgreSQL Backend Connections")
                    .command("SELECT pid, usename, client_addr, state, query_start FROM pg_stat_activity WHERE state != 'idle';")
                    .description("Identify blocking queries holding exclusive row or table locks.")
                    .build());
            steps.add(GeminiResolutionDTO.ResolutionStep.builder()
                    .stepNumber(2)
                    .title("Terminate Stalled Blocking Transaction")
                    .command("SELECT pg_cancel_backend(<pid>); -- or pg_terminate_backend(<pid>)")
                    .description("Gracefully release locks without taking down the cluster.")
                    .build());
            steps.add(GeminiResolutionDTO.ResolutionStep.builder()
                    .stepNumber(3)
                    .title("Verify Connection Pool Saturation")
                    .command("SHOW max_connections; SELECT count(*) FROM pg_stat_activity;")
                    .description("Ensure remaining pool capacity is > 20% buffer.")
                    .build());
            checklist.add("Confirm database CPU utilization drops below 40%");
            checklist.add("Verify application connection errors drop to 0 in log stream");
            checklist.add("Run read-replica health validation query");
        } else if (catLower.contains("security") || catLower.contains("access") || titleLower.contains("password")) {
            summary = "Identity authentication lockout or expired Kerberos/OAuth credential token.";
            rootCause = "Exceeded failed login attempts or Active Directory token sync delay.";
            estMinutes = 10;
            steps.add(GeminiResolutionDTO.ResolutionStep.builder()
                    .stepNumber(1)
                    .title("Audit User Account Status in Directory")
                    .command("net user <username> /domain")
                    .description("Check if account is active, locked out, or has an expired password flag.")
                    .build());
            steps.add(GeminiResolutionDTO.ResolutionStep.builder()
                    .stepNumber(2)
                    .title("Clear Account Lockout Flag")
                    .command("Unlock-ADAccount -Identity <username>")
                    .description("Reset consecutive bad password count to zero.")
                    .build());
            steps.add(GeminiResolutionDTO.ResolutionStep.builder()
                    .stepNumber(3)
                    .title("Issue Temporary Password Reset Link")
                    .command("Send-PasswordResetEmail -User <username> -RequireMfaValidation")
                    .description("Enforce multi-factor verification on next authentication challenge.")
                    .build());
            checklist.add("Confirm user successfully authenticates via MFA");
            checklist.add("Check security audit log for unusual geo-location access attempts");
        } else {
            summary = "System process malfunction or corrupted cache on client/server application.";
            rootCause = "Uncaught exception or out-of-memory memory leak in runtime container.";
            estMinutes = 20;
            steps.add(GeminiResolutionDTO.ResolutionStep.builder()
                    .stepNumber(1)
                    .title("Review Application Health Metrics & Error Log")
                    .command("journalctl -u itsm-service -n 100 --no-pager")
                    .description("Isolate stack traces or panic codes occurring around reported timestamp.")
                    .build());
            steps.add(GeminiResolutionDTO.ResolutionStep.builder()
                    .stepNumber(2)
                    .title("Clear Local Application Cache & Temp State")
                    .command("rm -rf /var/cache/app/* && systemctl reload itsm-service")
                    .description("Flush stale serialized session state and invalidate memory cache.")
                    .build());
            steps.add(GeminiResolutionDTO.ResolutionStep.builder()
                    .stepNumber(3)
                    .title("Verify HTTP Endpoint Status")
                    .command("curl -k -I https://localhost:8080/actuator/health")
                    .description("Confirm HTTP 200 OK and UP status from health check probes.")
                    .build());
            checklist.add("Verify user can access service without browser caching errors");
            checklist.add("Ensure service responds within SLA latency bounds (< 250ms)");
        }

        return GeminiResolutionDTO.builder()
                .incidentId(incident.getId())
                .incidentNumber(incident.getIncidentNumber())
                .title(incident.getTitle())
                .category(category)
                .service(service)
                .priority(incident.getPriority() != null ? incident.getPriority().name() : "P3_MEDIUM")
                .summary(summary)
                .rootCauseHypothesis(rootCause)
                .steps(steps)
                .estimatedMinutes(estMinutes)
                .verificationChecklist(checklist)
                .confidence("HIGH")
                .model("heuristic-rule-engine")
                .liveModel(false)
                .generatedAt(LocalDateTime.now())
                .build();
    }
}
