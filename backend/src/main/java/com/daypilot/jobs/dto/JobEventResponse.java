package com.daypilot.jobs.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneOffset;

import com.daypilot.jobs.JobEvent;
import com.daypilot.jobs.JobEventType;

public record JobEventResponse(
        Long id,
        JobEventType type,
        LocalDate eventDate,
        LocalTime eventTime,
        String details,
        String source,
        Instant createdAt) {

    public static JobEventResponse from(JobEvent e) {
        return new JobEventResponse(e.getId(), e.getType(), e.getEventDate(), e.getEventTime(),
                e.getDetails(), e.getSource(), e.getCreatedAt().toInstant(ZoneOffset.UTC));
    }
}