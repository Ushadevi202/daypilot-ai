package com.daypilot.jobs;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "job_applications")
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, updatable = false)
    private Long userId;

    @Column(nullable = false, length = 150)
    private String company;

    @Column(name = "job_title", nullable = false, length = 150)
    private String jobTitle;

    @Column(name = "job_url", length = 500)
    private String jobUrl;

    @Column(length = 150)
    private String location;

    @Column(name = "employment_type", length = 16)
    private String employmentType;

    @Column(length = 100)
    private String source;

    @Column(name = "applied_date")
    private LocalDate appliedDate;

    @Column(name = "resume_notes", length = 500)
    private String resumeNotes;

    @Column(name = "contact_name", length = 150)
    private String contactName;

    @Column(name = "contact_email", length = 255)
    private String contactEmail;

    @Column(nullable = false, length = 16)
    private String status = ApplicationStatus.APPLIED.name();

    // stored in UTC
    @Column(name = "status_changed_at", nullable = false)
    private LocalDateTime statusChangedAt;

    @Column(name = "next_action", length = 255)
    private String nextAction;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;

    @Column(length = 2000)
    private String notes;

    protected JobApplication() {
        // required by JPA
    }

    public JobApplication(Long userId) {
        this.userId = userId;
        this.statusChangedAt = LocalDateTime.now(ZoneOffset.UTC);
    }

    public void changeStatus(ApplicationStatus newStatus) {
        this.status = newStatus.name();
        this.statusChangedAt = LocalDateTime.now(ZoneOffset.UTC);
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public String getJobUrl() { return jobUrl; }
    public void setJobUrl(String jobUrl) { this.jobUrl = jobUrl; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public EmploymentType getEmploymentType() {
        return employmentType == null ? null : EmploymentType.valueOf(employmentType);
    }
    public void setEmploymentType(EmploymentType type) { this.employmentType = type == null ? null : type.name(); }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public LocalDate getAppliedDate() { return appliedDate; }
    public void setAppliedDate(LocalDate appliedDate) { this.appliedDate = appliedDate; }
    public String getResumeNotes() { return resumeNotes; }
    public void setResumeNotes(String resumeNotes) { this.resumeNotes = resumeNotes; }
    public String getContactName() { return contactName; }
    public void setContactName(String contactName) { this.contactName = contactName; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public ApplicationStatus getStatus() { return ApplicationStatus.valueOf(status); }
    public LocalDateTime getStatusChangedAt() { return statusChangedAt; }
    public String getNextAction() { return nextAction; }
    public void setNextAction(String nextAction) { this.nextAction = nextAction; }
    public LocalDate getFollowUpDate() { return followUpDate; }
    public void setFollowUpDate(LocalDate followUpDate) { this.followUpDate = followUpDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}