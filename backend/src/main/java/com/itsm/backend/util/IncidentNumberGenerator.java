package com.itsm.backend.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Generates unique incident numbers in the format: INC-YYYYMMDD-NNNN
 * Uses an atomic counter to ensure thread safety.
 *
 * OOP: Encapsulation — counter state is private and thread-safe.
 */
public final class IncidentNumberGenerator {

    private static final AtomicInteger counter = new AtomicInteger(1);
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    private IncidentNumberGenerator() { }

    public static String generate() {
        String datePart = LocalDateTime.now().format(FORMATTER);
        int seq = counter.getAndIncrement() % 10000;
        return String.format("INC-%s-%04d", datePart, seq);
    }

    /** Reset counter — used for testing */
    public static void reset() {
        counter.set(1);
    }
}
