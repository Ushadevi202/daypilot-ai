package com.daypilot.routine.dto;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.daypilot.routine.RecurrenceType;
import com.daypilot.routine.Routine;

public record RoutineResponse(
        Long id,
        String title,
        String description,
        LocalTime startTime,
        LocalTime endTime,
        int estimatedMinutes,
        RecurrenceType recurrenceType,
        List<DayOfWeek> daysOfWeek,
        LocalDate startDate,
        LocalDate endDate,
        boolean active) {

    public static RoutineResponse from(Routine r) {
        return new RoutineResponse(
                r.getId(), r.getTitle(), r.getDescription(), r.getStartTime(), r.getEndTime(),
                r.getEstimatedMinutes(), r.getRecurrenceType(), r.getDaysOfWeek().stream().sorted().toList(),
                r.getStartDate(), r.getEndDate(), r.isActive());
    }
}