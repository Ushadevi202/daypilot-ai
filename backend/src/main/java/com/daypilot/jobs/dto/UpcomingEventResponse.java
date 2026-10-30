package com.daypilot.jobs.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.daypilot.jobs.JobEventType;

public record UpcomingEventResponse(
        Long applicationId,
        String company,
        String jobTitle,
        JobEventType type,
        LocalDate eventDate,
        LocalTime eventTime,
        String details) {
}