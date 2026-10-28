package com.daypilot.task.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotNull;

public record PostponeRequest(@NotNull LocalDate dueDate, LocalTime scheduledTime) {
}
