package com.daypilot.task.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneOffset;

import com.daypilot.task.Task;
import com.daypilot.task.TaskPriority;
import com.daypilot.task.TaskStatus;

public record TaskResponse(
        Long id,
        String title,
        String description,
        String category,
        TaskPriority priority,
        TaskStatus status,
        LocalDate dueDate,
        LocalTime scheduledTime,
        Integer estimatedMinutes,
        String notes,
        int postponedCount,
        boolean overdue,
        Instant completedAt) {

    public static TaskResponse from(Task t, LocalDate today) {
        boolean overdue = t.getStatus() == TaskStatus.PENDING
                && t.getDueDate() != null && t.getDueDate().isBefore(today);
        return new TaskResponse(t.getId(), t.getTitle(), t.getDescription(), t.getCategory(), t.getPriority(),
                t.getStatus(), t.getDueDate(), t.getScheduledTime(), t.getEstimatedMinutes(), t.getNotes(),
                t.getPostponedCount(), overdue,
                t.getCompletedAt() == null ? null : t.getCompletedAt().toInstant(ZoneOffset.UTC));
    }
}
