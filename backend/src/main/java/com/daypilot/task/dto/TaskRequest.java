package com.daypilot.task.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.daypilot.task.TaskPriority;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TaskRequest(
        @NotBlank @Size(max = 150) String title,
        @Size(max = 1000) String description,
        @Size(max = 50) String category,
        TaskPriority priority,
        LocalDate dueDate,
        LocalTime scheduledTime,
        @Min(1) @Max(1440) Integer estimatedMinutes,
        @Size(max = 2000) String notes) {
}