package com.daypilot.task.dto;

import java.time.Instant;
import java.time.ZoneOffset;

import com.daypilot.task.TaskHistory;

public record HistoryResponse(String action, String details, Instant at) {

    public static HistoryResponse from(TaskHistory h) {
        return new HistoryResponse(h.getAction(), h.getDetails(), h.getCreatedAt().toInstant(ZoneOffset.UTC));
    }
}
