package com.itsm.backend.config;

import com.itsm.backend.domain.entity.*;
import com.itsm.backend.domain.enums.*;
import com.itsm.backend.repository.*;
import com.itsm.backend.service.TechnicianService;
import com.itsm.backend.service.UserService;
import com.itsm.backend.service.IncidentService;
import com.itsm.backend.service.intelligence.DuplicateDetectionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Seeds the database with default data on first startup:
 * - SLA policies (P1–P4)
 * - Default admin user (admin / Admin@123)
 * - Default categories with keywords
 * - Default services
 * - Default assignment strategy config
 * - Sample technician users
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final SlaPolicyRepository slaPolicyRepository;
    private final CategoryRepository categoryRepository;
    private final ItServiceRepository itServiceRepository;
    private final SystemConfigRepository systemConfigRepository;
    private final UserRepository userRepository;
    private final TechnicianService technicianService;
    private final UserService userService;
    private final IncidentRepository incidentRepository;
    private final DuplicateDetectionService duplicateDetectionService;
    private final IncidentService incidentService;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        migrateP0PriorityConstraint();
        seedSlaPolicies();
        seedSystemConfig();
        seedAdminUser();
        seedCategories();
        seedServices();
        seedSampleTechnicians();
        seedSampleEmployees();
        correlateExistingDuplicates();
        log.info("=== I-ITSM Data Loader complete ===");
    }

    /**
     * Migrates the priority CHECK constraint on incidents and sla_policies tables
     * to include P0_EMERGENCY (added in Workflow 3 duplicate escalation fix).
     * Safe to run multiple times — skips if P0_EMERGENCY already present.
     */
    private void migrateP0PriorityConstraint() {
        try {
            // Check if incidents constraint already includes P0
            String def = jdbcTemplate.queryForObject(
                "SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'incidents_priority_check'",
                String.class
            );
            if (def != null && def.contains("P0_EMERGENCY")) {
                return; // Already migrated
            }
            log.info("Migrating priority CHECK constraints to include P0_EMERGENCY...");

            jdbcTemplate.execute("ALTER TABLE incidents DROP CONSTRAINT IF EXISTS incidents_priority_check");
            jdbcTemplate.execute("ALTER TABLE incidents ADD CONSTRAINT incidents_priority_check " +
                "CHECK (priority IN ('P0_EMERGENCY','P1_CRITICAL','P2_HIGH','P3_MEDIUM','P4_LOW'))");

            jdbcTemplate.execute("ALTER TABLE sla_policies DROP CONSTRAINT IF EXISTS sla_policies_priority_check");
            jdbcTemplate.execute("ALTER TABLE sla_policies ADD CONSTRAINT sla_policies_priority_check " +
                "CHECK (priority IN ('P0_EMERGENCY','P1_CRITICAL','P2_HIGH','P3_MEDIUM','P4_LOW'))");

            log.info("Priority constraints migrated successfully — P0_EMERGENCY is now a valid priority level.");
        } catch (Exception e) {
            log.warn("Could not migrate priority constraints (may already be correct or non-PostgreSQL): {}", e.getMessage());
        }
    }

    private void seedSlaPolicies() {
        if (slaPolicyRepository.count() > 0) return;
        slaPolicyRepository.saveAll(List.of(
            SlaPolicy.builder().priority(Priority.P1_CRITICAL).responseMinutes(5).resolutionMinutes(30).build(),
            SlaPolicy.builder().priority(Priority.P2_HIGH).responseMinutes(15).resolutionMinutes(120).build(),
            SlaPolicy.builder().priority(Priority.P3_MEDIUM).responseMinutes(60).resolutionMinutes(480).build(),
            SlaPolicy.builder().priority(Priority.P4_LOW).responseMinutes(240).resolutionMinutes(1440).build()
        ));
        log.info("Seeded SLA policies");
    }

    private void seedSystemConfig() {
        if (systemConfigRepository.findByConfigKey("ASSIGNMENT_STRATEGY").isEmpty()) {
            systemConfigRepository.save(SystemConfig.builder()
                    .configKey("ASSIGNMENT_STRATEGY")
                    .configValue("SKILL_BASED")
                    .description("Active technician assignment strategy")
                    .build());
            log.info("Seeded system config");
        }
    }

    private void seedAdminUser() {
        if (!userRepository.existsByUsername("admin")) {
            userService.register("admin", "admin@itsm.local", "Admin@123",
                    "System Administrator", "IT", "+1-000-000-0000", Role.ADMINISTRATOR);
            log.info("Created default admin user (admin / Admin@123)");
        }
    }

    private void seedCategories() {
        if (categoryRepository.count() > 0) return;
        categoryRepository.saveAll(List.of(
            Category.builder().name("Network").description("Network connectivity and infrastructure issues")
                    .keywords("network,internet,wifi,vpn,connectivity,router,switch,ethernet,lan,wan,dns,firewall").build(),
            Category.builder().name("Hardware").description("Physical device failures and hardware issues")
                    .keywords("hardware,laptop,computer,pc,monitor,keyboard,mouse,printer,scanner,server,disk,ram,cpu,battery,power").build(),
            Category.builder().name("Software").description("Application and software issues")
                    .keywords("software,application,app,crash,install,error,bug,update,upgrade,license,office,browser,antivirus").build(),
            Category.builder().name("Security").description("Security incidents and access issues")
                    .keywords("security,password,phishing,virus,malware,ransomware,breach,unauthorized,access,locked,account,hack,vulnerability").build(),
            Category.builder().name("Email").description("Email and communication issues")
                    .keywords("email,mail,outlook,inbox,smtp,calendar,meeting,teams,zoom,communication,attachment,spam").build(),
            Category.builder().name("Database").description("Database connectivity and data issues")
                    .keywords("database,db,sql,oracle,postgresql,mysql,data,query,connection,timeout,backup,restore").build(),
            Category.builder().name("Access Management").description("User accounts, permissions, and access requests")
                    .keywords("access,permission,login,account,user,password,reset,role,directory,active directory,ad,ldap").build(),
            Category.builder().name("Other").description("Miscellaneous IT incidents")
                    .keywords("other,general,misc,miscellaneous").build()
        ));
        log.info("Seeded categories");
    }

    private void seedServices() {
        if (itServiceRepository.count() > 0) return;
        Category network = categoryRepository.findByName("Network").orElse(null);
        Category hardware = categoryRepository.findByName("Hardware").orElse(null);
        Category software = categoryRepository.findByName("Software").orElse(null);
        Category security = categoryRepository.findByName("Security").orElse(null);
        Category email = categoryRepository.findByName("Email").orElse(null);
        Category db = categoryRepository.findByName("Database").orElse(null);
        Category access = categoryRepository.findByName("Access Management").orElse(null);

        itServiceRepository.saveAll(List.of(
            ItService.builder().name("Corporate WiFi").description("Office wireless network").category(network).build(),
            ItService.builder().name("VPN Service").description("Remote access VPN").category(network).build(),
            ItService.builder().name("Internet Access").description("General internet connectivity").category(network).build(),
            ItService.builder().name("Employee Laptop").description("Company-issued laptops").category(hardware).build(),
            ItService.builder().name("Printers & Scanners").description("Office printing infrastructure").category(hardware).build(),
            ItService.builder().name("Microsoft Office 365").description("Office productivity suite").category(software).build(),
            ItService.builder().name("HR System").description("Human resources management platform").category(software).build(),
            ItService.builder().name("ERP System").description("Enterprise resource planning").category(software).build(),
            ItService.builder().name("Email (Outlook)").description("Corporate email service").category(email).build(),
            ItService.builder().name("Active Directory").description("User accounts and authentication").category(access).build(),
            ItService.builder().name("Antivirus").description("Endpoint security software").category(security).build(),
            ItService.builder().name("Oracle Database").description("Production Oracle DB").category(db).build()
        ));
        log.info("Seeded IT services");
    }

    private void seedSampleTechnicians() {
        if (userRepository.findByRole(Role.TECHNICIAN).size() > 0) return;
        try {
            User t1 = userService.register("tech.network", "tech.network@itsm.local", "Tech@123",
                    "Alex Network", "IT Operations", "+1-100-100-0001", Role.TECHNICIAN);
            technicianService.createTechnicianProfile(t1.getId(), "Network Engineering",
                    List.of("network", "wifi", "vpn", "firewall", "router", "switch", "internet"));

            User t2 = userService.register("tech.hardware", "tech.hardware@itsm.local", "Tech@123",
                    "Maria Hardware", "IT Support", "+1-100-100-0002", Role.TECHNICIAN);
            technicianService.createTechnicianProfile(t2.getId(), "Hardware Support",
                    List.of("hardware", "laptop", "pc", "printer", "scanner", "battery", "disk"));

            User t3 = userService.register("tech.software", "tech.software@itsm.local", "Tech@123",
                    "James Software", "Application Support", "+1-100-100-0003", Role.TECHNICIAN);
            technicianService.createTechnicianProfile(t3.getId(), "Software & Applications",
                    List.of("software", "application", "office", "erp", "browser", "install", "license"));

            User t4 = userService.register("tech.security", "tech.security@itsm.local", "Tech@123",
                    "Sara Security", "Cybersecurity", "+1-100-100-0004", Role.TECHNICIAN);
            technicianService.createTechnicianProfile(t4.getId(), "Security",
                    List.of("security", "antivirus", "malware", "access", "password", "phishing", "vulnerability"));

            log.info("Seeded 4 sample technicians");
        } catch (Exception e) {
            log.warn("Sample technicians already exist or failed to seed: {}", e.getMessage());
        }
    }

    private void seedSampleEmployees() {
        try {
            if (!userRepository.existsByUsername("user1")) {
                userService.register("user1", "user1@itsm.local", "User@123",
                        "John Employee", "Operations", "+1-555-0100", Role.EMPLOYEE);
                log.info("Created default employee user (user1 / User@123)");
            }
            if (!userRepository.existsByUsername("user2")) {
                userService.register("user2", "user2@itsm.local", "User@123",
                        "Jane Employee", "Finance", "+1-555-0101", Role.EMPLOYEE);
                log.info("Created default employee user (user2 / User@123)");
            }
        } catch (Exception e) {
            log.warn("Sample employees already exist or failed to seed: {}", e.getMessage());
        }
    }

    private void correlateExistingDuplicates() {
        try {
            List<Incident> openIncidents = incidentRepository.findAllOpen();
            for (int i = 0; i < openIncidents.size(); i++) {
                Incident inc1 = openIncidents.get(i);
                if (inc1.getDuplicateOf() != null) continue;

                List<Incident> matches = duplicateDetectionService.findPotentialDuplicates(
                        inc1.getTitle(), inc1.getDescription(),
                        inc1.getCategory() != null ? inc1.getCategory().getId() : null,
                        inc1.getService() != null ? inc1.getService().getId() : null,
                        inc1.getId()
                );

                for (Incident match : matches) {
                    if (match.getId() > inc1.getId() && match.getDuplicateOf() == null) {
                        User systemAdmin = userRepository.findByUsername("admin").orElse(inc1.getReporter());
                        incidentService.correlateDuplicatesAndUpgradePriority(match, List.of(inc1), systemAdmin);
                        log.info("Correlated existing duplicate incidents {} and {} -> upgraded priority to {}",
                                inc1.getIncidentNumber(), match.getIncidentNumber(), match.getPriority());
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Existing duplicate correlation pass skipped: {}", e.getMessage());
        }
    }
}
