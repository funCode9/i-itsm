package com.itsm.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Enables async event listeners (Observer pattern) and scheduled tasks (SLA monitoring).
 */
@Configuration
@EnableAsync
@EnableScheduling
public class AsyncConfig {
}
