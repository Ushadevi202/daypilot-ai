package com.daypilot.routine.dto;

import java.time.LocalTime;

import jakarta.validation.constraints.NotNull;

public record RescheduleRequest(@NotNull LocalTime startTime, @NotNull LocalTime endTime) {
}