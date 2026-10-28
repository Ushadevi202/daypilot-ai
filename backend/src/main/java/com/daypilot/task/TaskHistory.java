package com.daypilot.task;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "task_history")
public class TaskHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "task_id", nullable = false, updatable = false)
    private Long taskId;

    @Column(name = "user_id", nullable = false, updatable = false)
    private Long userId;

    @Column(nullable = false, length = 16, updatable = false)
    private String action;

    @Column(length = 500, updatable = false)
    private String details;

    // stored in UTC
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected TaskHistory() {
        // required by JPA
    }

    public TaskHistory(Long taskId, Long userId, String action, String details) {
        this.taskId = taskId;
        this.userId = userId;
        this.action = action;
        this.details = details;
        this.createdAt = LocalDateTime.now(ZoneOffset.UTC);
    }

    public String getAction() { return action; }
    public String getDetails() { return details; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}