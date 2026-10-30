package com.daypilot.jobs;

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
@Table(name = "job_events")
public class JobEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_application_id", nullable = false, updatable = false)
    private Long jobApplicationId;

    @Column(name = "user_id", nullable = false, updatable = false)
    private Long userId;

    @Column(nullable = false, length = 24, updatable = false)
    private String type;

    @Column(name = "event_date", updatable = false)
    private LocalDate eventDate;

    @Column(name = "event_time", updatable = false)
    private LocalTime eventTime;

    @Column(length = 1000, updatable = false)
    private String details;

    @Column(nullable = false, length = 10, updatable = false)
    private String source;

    // stored in UTC
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected JobEvent() {
        // required by JPA
    }

    public JobEvent(Long jobApplicationId, Long userId, JobEventType type, LocalDate eventDate,
                    LocalTime eventTime, String details, String source) {
        this.jobApplicationId = jobApplicationId;
        this.userId = userId;
        this.type = type.name();
        this.eventDate = eventDate;
        this.eventTime = eventTime;
        this.details = details;
        this.source = source;
        this.createdAt = LocalDateTime.now(ZoneOffset.UTC);
    }

    public Long getId() { return id; }
    public Long getJobApplicationId() { return jobApplicationId; }
    public JobEventType getType() { return JobEventType.valueOf(type); }
    public LocalDate getEventDate() { return eventDate; }
    public LocalTime getEventTime() { return eventTime; }
    public String getDetails() { return details; }
    public String getSource() { return source; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}