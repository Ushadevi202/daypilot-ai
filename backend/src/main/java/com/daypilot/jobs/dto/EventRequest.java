package com.daypilot.jobs.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.daypilot.jobs.JobEventType;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record EventRequest(
        @NotNull JobEventType type,
        LocalDate eventDate,
        LocalTime eventTime,
        @Size(max = 1000) String details) {
}