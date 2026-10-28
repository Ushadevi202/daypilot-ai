package com.daypilot.task;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneOffset;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, updatable = false)
    private Long userId;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(length = 50)
    private String category;

    @Column(nullable = false, length = 10)
    private String priority = TaskPriority.MEDIUM.name();

    @Column(nullable = false, length = 16)
    private String status = TaskStatus.PENDING.name();

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "scheduled_time")
    private LocalTime scheduledTime;

    @Column(name = "estimated_minutes")
    private Integer estimatedMinutes;

    @Column(length = 2000)
    private String notes;

    @Column(name = "postponed_count", nullable = false)
    private int postponedCount;

    // stored in UTC
    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    protected Task() {
        // required by JPA
    }

    public Task(Long userId) {
        this.userId = userId;
    }

    public void markCompleted() {
        this.status = TaskStatus.COMPLETED.name();
        this.completedAt = LocalDateTime.now(ZoneOffset.UTC);
    }

    public void reopen() {
        this.status = TaskStatus.PENDING.name();
        this.completedAt = null;
    }

    public void postponeTo(LocalDate newDate, LocalTime newTime) {
        this.dueDate = newDate;
        if (newTime != null) {
            this.scheduledTime = newTime;
        }
        this.postponedCount++;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public TaskPriority getPriority() { return TaskPriority.valueOf(priority); }
    public void setPriority(TaskPriority priority) { this.priority = priority.name(); }
    public TaskStatus getStatus() { return TaskStatus.valueOf(status); }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public LocalTime getScheduledTime() { return scheduledTime; }
    public void setScheduledTime(LocalTime scheduledTime) { this.scheduledTime = scheduledTime; }
    public Integer getEstimatedMinutes() { return estimatedMinutes; }
    public void setEstimatedMinutes(Integer estimatedMinutes) { this.estimatedMinutes = estimatedMinutes; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public int getPostponedCount() { return postponedCount; }
    public LocalDateTime getCompletedAt() { return completedAt; }
}