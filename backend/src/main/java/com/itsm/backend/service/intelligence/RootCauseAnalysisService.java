package com.itsm.backend.service.intelligence;

import com.itsm.backend.domain.entity.Incident;
import com.itsm.backend.domain.entity.IncidentNote;
import com.itsm.backend.dto.RootCauseAnalysisDTO;
import com.itsm.backend.exception.ResourceNotFoundException;
import com.itsm.backend.repository.IncidentNoteRepository;
import com.itsm.backend.repository.IncidentRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Intelligent Feature: Automated Root-Cause Analysis (RCA).
 *
 * Employs heuristic symptom-to-failure taxonomy mapping, multi-field lexical extraction,
 * and service correlation clustering to infer root causes, workarounds, and remediation steps.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RootCauseAnalysisService {

    private final IncidentRepository incidentRepository;
    private final IncidentNoteRepository noteRepository;

    @Data
    @Builder
    private static class RcaPattern {
        private String domain;
        private String probableCause;
        private List<String> triggerKeywords;
        private List<String> remediationSteps;
        private List<String> preventiveRecommendations;
        private String workaround;
    }

    private static final List<RcaPattern> PATTERNS = List.of(
            RcaPattern.builder()
                    .domain("Network & Infrastructure")
                    .probableCause("DNS Resolution Failure / VPN Gateway Tunnel Degradation")
                    .triggerKeywords(List.of("vpn", "wifi", "dns", "gateway", "packet loss", "router", "latency", "ip", "connection", "ping", "unreachable", "slow"))
                    .remediationSteps(List.of(
                            "Verify external edge router interfaces and packet error rates",
                            "Flush local and gateway DNS caches (ipconfig /flushdns or systemd-resolve)",
                            "Check VPN concentrator active sessions vs licensing limit",
                            "Validate MTU size to avoid fragmentation across secure tunnels"
                    ))
                    .preventiveRecommendations(List.of(
                            "Deploy secondary redundant upstream DNS resolvers",
                            "Set up synthetic heartbeat probes on critical VPN endpoints",
                            "Implement BGP multi-homing failover for primary ISP lines"
                    ))
                    .workaround("Route through fallback backup VPN cluster or direct web proxy profile.")
                    .build(),

            RcaPattern.builder()
                    .domain("Database & Persistence")
                    .probableCause("Connection Pool Saturation or Locking/Deadlock Contention")
                    .triggerKeywords(List.of("database", "sql", "postgres", "mysql", "deadlock", "pool", "query", "timeout", "hikari", "table lock", "slow query"))
                    .remediationSteps(List.of(
                            "Inspect active connection count against HikariCP max-pool-size limits",
                            "Identify blocking transactions via pg_stat_activity / locks view",
                            "Kill long-running orphan transaction IDs holding exclusive locks",
                            "Review recent schema migration queries or missing index scans"
                    ))
                    .preventiveRecommendations(List.of(
                            "Fine-tune statement timeout and connection acquisition timeouts",
                            "Establish automated read-replica routing for read-heavy reporting queries",
                            "Set automated alerts when active database pool utilization exceeds 85%"
                    ))
                    .workaround("Temporarily restart non-essential background worker jobs to release connection leases.")
                    .build(),

            RcaPattern.builder()
                    .domain("Security & Identity")
                    .probableCause("Directory Service Token Expiry or User Account Permission Lockout")
                    .triggerKeywords(List.of("login", "auth", "unauthorized", "401", "403", "forbidden", "password", "jwt", "token", "ldap", "sso", "credentials", "disabled", "expired", "permission"))
                    .remediationSteps(List.of(
                            "Inspect user directory state (Active Directory / LDAP account lockout status)",
                            "Validate system clock-skew and JWT signature expiration timestamps",
                            "Check RBAC role mappings and permissions for user's assigned group",
                            "Issue immediate credential reset or unlock via Admin Operations console"
                    ))
                    .preventiveRecommendations(List.of(
                            "Configure automated email alerts 7 days prior to credential / certificate expiration",
                            "Integrate self-service password reset (SSPR) workflow",
                            "Audit IAM group memberships quarterly for principle of least privilege"
                    ))
                    .workaround("Authenticate using backup administrator credentials or bypass token delegation.")
                    .build(),

            RcaPattern.builder()
                    .domain("Infrastructure & Compute")
                    .probableCause("Host Resource Depletion (Memory Leak or Disk Volume Capacity Exhaustion)")
                    .triggerKeywords(List.of("memory", "cpu", "oom", "disk", "heap", "out of memory", "storage", "full", "crash", "restart", "100%", "swap", "capacity"))
                    .remediationSteps(List.of(
                            "Execute disk space audit on /var/log, /tmp, and persistent volumes",
                            "Purge or compress rotated application logs and core dump files",
                            "Capture JVM thread/heap dump for leak analysis prior to service restart",
                            "Scale pod/container memory limits or expand storage volume size"
                    ))
                    .preventiveRecommendations(List.of(
                            "Configure logrotate with strict file size caps and gzip compression",
                            "Set Prometheus/Grafana threshold alerts at 80% disk and 85% memory consumption",
                            "Implement automated JVM garbage collection telemetry"
                    ))
                    .workaround("Clear temporary cache directories and restart container service.")
                    .build(),

            RcaPattern.builder()
                    .domain("Software & Application")
                    .probableCause("Unhandled Exception / Regressive Bug in Application Component")
                    .triggerKeywords(List.of("nullpointer", "exception", "bug", "error code", "stack trace", "internal error", "500", "crash", "deploy", "release", "frontend", "ui", "build"))
                    .remediationSteps(List.of(
                            "Inspect application log stream for root cause exception stack trace",
                            "Verify recent software deployment commits or feature flag activations",
                            "Execute canary rollback if regression coincides with deployment window",
                            "Apply defensive null-check or hotfix patch to affected module"
                    ))
                    .preventiveRecommendations(List.of(
                            "Incorporate end-to-end integration tests in CI/CD pipeline",
                            "Enable circuit-breaker patterns (Resilience4j) on third-party service invocations",
                            "Require peer code review approval on all production-bound pull requests"
                    ))
                    .workaround("Toggle feature flag to disable the newly introduced module.")
                    .build(),

            RcaPattern.builder()
                    .domain("End-User Hardware & Peripherals")
                    .probableCause("Hardware Peripheral Malfunction or Corrupted Device Driver")
                    .triggerKeywords(List.of("hardware", "printer", "keyboard", "monitor", "screen", "cable", "mouse", "usb", "device", "laptop", "power", "display", "jam"))
                    .remediationSteps(List.of(
                            "Verify physical cable seating, power distribution, and port integrity",
                            "Reinstall or roll back peripheral device drivers via Device Manager",
                            "Run vendor hardware diagnostic utility for firmware/component status",
                            "Deploy hot-swap spare hardware unit to restore employee productivity"
                    ))
                    .preventiveRecommendations(List.of(
                            "Maintain 10% inventory buffer of certified peripherals for immediate swap",
                            "Implement scheduled hardware lifecycle refreshes every 36 months",
                            "Standardize approved peripheral model lists across all departments"
                    ))
                    .workaround("Assign temporary loaner device while primary unit undergoes diagnostic repair.")
                    .build()
    );

    @Transactional(readOnly = true)
    public RootCauseAnalysisDTO analyzeIncident(Long incidentId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident", incidentId));

        // Gather all textual evidence
        StringBuilder corpus = new StringBuilder();
        if (incident.getTitle() != null) corpus.append(" ").append(incident.getTitle());
        if (incident.getDescription() != null) corpus.append(" ").append(incident.getDescription());
        if (incident.getCategory() != null) corpus.append(" ").append(incident.getCategory().getName());
        if (incident.getService() != null) corpus.append(" ").append(incident.getService().getName());

        List<IncidentNote> notes = noteRepository.findByIncidentIdOrderByCreatedAtAsc(incidentId);
        for (IncidentNote n : notes) {
            if (n.getContent() != null) corpus.append(" ").append(n.getContent());
        }

        String normalizedText = corpus.toString().toLowerCase();
        Set<String> tokens = tokenize(normalizedText);

        // Score against RCA patterns
        RcaPattern bestPattern = null;
        int maxMatchedKeywords = 0;
        List<String> bestEvidence = new ArrayList<>();

        for (RcaPattern pattern : PATTERNS) {
            List<String> matched = new ArrayList<>();
            for (String kw : pattern.getTriggerKeywords()) {
                if (normalizedText.contains(kw) || tokens.contains(kw)) {
                    matched.add(kw);
                }
            }

            if (matched.size() > maxMatchedKeywords) {
                maxMatchedKeywords = matched.size();
                bestPattern = pattern;
                bestEvidence = matched;
            }
        }

        // Default fallback if no specific keywords match
        if (bestPattern == null || maxMatchedKeywords == 0) {
            bestPattern = PATTERNS.get(4); // Software & Application default
            bestEvidence = List.of("general incident symptom analysis");
        }

        // Calculate confidence score (scale: 55% - 96%)
        int confidence = Math.min(96, Math.max(55, 50 + (maxMatchedKeywords * 9)));

        // Correlate with other recent incidents on same service / category
        int correlatedCount = 0;
        String correlationSummary = "Isolated incident; no immediate cluster observed";
        if (incident.getService() != null) {
            List<Incident> sameServiceIncidents = incidentRepository.findAll().stream()
                    .filter(i -> !i.getId().equals(incident.getId()))
                    .filter(i -> i.getService() != null && i.getService().getId().equals(incident.getService().getId()))
                    .filter(i -> i.getCreatedAt() != null && incident.getCreatedAt() != null
                            && Math.abs(java.time.Duration.between(i.getCreatedAt(), incident.getCreatedAt()).toHours()) <= 48)
                    .collect(Collectors.toList());

            correlatedCount = sameServiceIncidents.size();
            if (correlatedCount > 0) {
                correlationSummary = String.format("Correlated with %d other incident(s) on service '%s' within 48 hours (potential service-wide disruption)",
                        correlatedCount, incident.getService().getName());
                confidence = Math.min(99, confidence + 5);
            }
        }

        return RootCauseAnalysisDTO.builder()
                .incidentId(incident.getId())
                .incidentNumber(incident.getIncidentNumber())
                .title(incident.getTitle())
                .categoryName(incident.getCategory() != null ? incident.getCategory().getName() : "Uncategorized")
                .serviceName(incident.getService() != null ? incident.getService().getName() : "Unassigned Service")
                .domainClassification(bestPattern.getDomain())
                .probableRootCause(bestPattern.getProbableCause())
                .confidenceScore(confidence)
                .evidenceKeywords(bestEvidence)
                .remediationSteps(bestPattern.getRemediationSteps())
                .preventiveRecommendations(bestPattern.getPreventiveRecommendations())
                .recommendedWorkaround(bestPattern.getWorkaround())
                .correlatedIncidentCount(correlatedCount)
                .correlationSummary(correlationSummary)
                .analyzedAt(LocalDateTime.now())
                .build();
    }

    private Set<String> tokenize(String text) {
        Set<String> set = new HashSet<>();
        String[] parts = text.split("[\\s,;.!?()\\[\\]{}\"']+");
        for (String p : parts) {
            if (p.length() >= 3) set.add(p);
        }
        return set;
    }
}
