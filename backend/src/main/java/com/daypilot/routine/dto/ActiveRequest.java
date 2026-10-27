package com.daypilot.routine.dto;

import jakarta.validation.constraints.NotNull;

public record ActiveRequest(@NotNull Boolean active) {
}