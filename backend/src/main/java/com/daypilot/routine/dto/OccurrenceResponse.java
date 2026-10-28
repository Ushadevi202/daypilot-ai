package com.daypilot.routine.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneOffset;

import com.daypilot.routine.OccurrenceStatus;
import com.daypilot.routine.RoutineOccurrence;

public record OccurrenceResponse(
        Long id,
        Long routineId,
        LocalDate date,
        String title,
        String description,
        LocalTime startTime,
        LocalTime endTime,
        int estimatedMinutes,
        OccurrenceStatus status,
        boolean rescheduled,
        Instant completedAt) {

    public static OccurrenceResponse from(RoutineOccurrence o) {
        return new OccurrenceResponse(o.getId(), o.getRoutineId(), o.getOccurrenceDate(), o.getTitle(),
                o.getDescription(), o.getStartTime(), o.getEndTime(), o.getEstimatedMinutes(), o.getStatus(),
                o.isCustomized(),
                o.getCompletedAt() == null ? null : o.getCompletedAt().toInstant(ZoneOffset.UTC));
    }
}