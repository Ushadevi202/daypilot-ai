package com.daypilot.routine.dto;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

import com.daypilot.routine.RecurrenceType;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RoutineRequest(
        @NotBlank @Size(max = 150) String title,
        @Size(max = 1000) String description,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,
        @Min(1) @Max(1440) Integer estimatedMinutes,
        @NotNull RecurrenceType recurrenceType,
        Set<DayOfWeek> daysOfWeek,
        @NotNull LocalDate startDate,
        LocalDate endDate) {
}