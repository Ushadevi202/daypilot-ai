package com.daypilot.routine;

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
@Table(name = "routine_occurrences")
public class RoutineOccurrence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, updatable = false)
    private Long userId;

    // becomes NULL if the routine template is deleted; the snapshot below keeps the history readable
    @Column(name = "routine_id")
    private Long routineId;

    @Column(name = "occurrence_date", nullable = false, updatable = false)
    private LocalDate occurrenceDate;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "estimated_minutes", nullable = false)
    private int estimatedMinutes;

    @Column(nullable = false, length = 16)
    private String status = OccurrenceStatus.PENDING.name();

    // true when the user moved this single day; template edits then leave its times alone
    @Column(nullable = false)
    private boolean customized;

    // stored in UTC
    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    protected RoutineOccurrence() {
        // required by JPA; rows are created by the generator's SQL insert
    }

    public void copySnapshotFrom(Routine r) {
        this.title = r.getTitle();
        this.description = r.getDescription();
        this.startTime = r.getStartTime();
        this.endTime = r.getEndTime();
        this.estimatedMinutes = r.getEstimatedMinutes();
    }

    public void changeStatus(OccurrenceStatus newStatus) {
        this.status = newStatus.name();
        this.completedAt = newStatus == OccurrenceStatus.COMPLETED ? LocalDateTime.now(ZoneOffset.UTC) : null;
    }

    public void reschedule(LocalTime start, LocalTime end, int minutes) {
        this.startTime = start;
        this.endTime = end;
        this.estimatedMinutes = minutes;
        this.customized = true;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public Long getRoutineId() { return routineId; }
    public LocalDate getOccurrenceDate() { return occurrenceDate; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public int getEstimatedMinutes() { return estimatedMinutes; }
    public OccurrenceStatus getStatus() { return OccurrenceStatus.valueOf(status); }
    public boolean isCustomized() { return customized; }
    public LocalDateTime getCompletedAt() { return completedAt; }
}