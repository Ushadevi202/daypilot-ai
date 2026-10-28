package com.daypilot.routine.dto;

import com.daypilot.routine.OccurrenceStatus;

import jakarta.validation.constraints.NotNull;

public record StatusRequest(@NotNull OccurrenceStatus status) {
}