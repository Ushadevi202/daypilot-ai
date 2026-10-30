package com.daypilot.jobs.dto;

import com.daypilot.jobs.ApplicationStatus;

import jakarta.validation.constraints.NotNull;

public record StatusRequest(@NotNull ApplicationStatus status) {
}