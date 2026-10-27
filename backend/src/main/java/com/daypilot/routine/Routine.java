package com.daypilot.routine;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "routines")
public class Routine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, updatable = false)
    private Long userId;

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

    @Column(name = "recurrence_type", nullable = false, length = 16)
    private String recurrenceType;

    @Column(name = "days_of_week", length = 64)
    private String daysOfWeekCsv;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(nullable = false)
    private boolean active = true;

    protected Routine() {
        // required by JPA
    }

    public Routine(Long userId) {
        this.userId = userId;
    }

    /** True if this template schedules an occurrence on the given date (ignores the active flag). */
    public boolean occursOn(LocalDate date) {
        if (date.isBefore(startDate)) return false;
        if (endDate != null && date.isAfter(endDate)) return false;
        return switch (getRecurrenceType()) {
            case DAILY -> true;
            case WEEKLY -> getDaysOfWeek().contains(date.getDayOfWeek());
        };
    }

    public RecurrenceType getRecurrenceType() {
        return RecurrenceType.valueOf(recurrenceType);
    }

    public Set<DayOfWeek> getDaysOfWeek() {
        if (daysOfWeekCsv == null || daysOfWeekCsv.isBlank()) {
            return EnumSet.noneOf(DayOfWeek.class);
        }
        return Arrays.stream(daysOfWeekCsv.split(","))
                .map(DayOfWeek::valueOf)
                .collect(Collectors.toCollection(() -> EnumSet.noneOf(DayOfWeek.class)));
    }

    public void setRecurrence(RecurrenceType type, Set<DayOfWeek> days) {
        this.recurrenceType = type.name();
        if (type == RecurrenceType.WEEKLY && days != null && !days.isEmpty()) {
            this.daysOfWeekCsv = days.stream().sorted().map(DayOfWeek::name).collect(Collectors.joining(","));
        } else {
            this.daysOfWeekCsv = null;
        }
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public int getEstimatedMinutes() { return estimatedMinutes; }
    public void setEstimatedMinutes(int estimatedMinutes) { this.estimatedMinutes = estimatedMinutes; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}