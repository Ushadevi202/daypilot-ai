package com.daypilot.jobs.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Set;

import com.daypilot.jobs.ApplicationStatus;
import com.daypilot.jobs.EmploymentType;
import com.daypilot.jobs.JobApplication;

public record JobApplicationResponse(
        Long id,
        String company,
        String jobTitle,
        String jobUrl,
        String location,
        EmploymentType employmentType,
        String source,
        ApplicationStatus status,
        Instant statusChangedAt,
        LocalDate appliedDate,
        String resumeNotes,
        String contactName,
        String contactEmail,
        String nextAction,
        LocalDate followUpDate,
        boolean followUpDue,
        String notes) {

    private static final Set<ApplicationStatus> ACTIVE =
            Set.of(ApplicationStatus.APPLIED, ApplicationStatus.ASSESSMENT,
                    ApplicationStatus.INTERVIEW, ApplicationStatus.ON_HOLD);

    public static JobApplicationResponse from(JobApplication a, LocalDate today) {
        boolean due = a.getFollowUpDate() != null && !a.getFollowUpDate().isAfter(today)
                && ACTIVE.contains(a.getStatus());
        return new JobApplicationResponse(a.getId(), a.getCompany(), a.getJobTitle(), a.getJobUrl(),
                a.getLocation(), a.getEmploymentType(), a.getSource(), a.getStatus(),
                a.getStatusChangedAt().toInstant(ZoneOffset.UTC), a.getAppliedDate(), a.getResumeNotes(),
                a.getContactName(), a.getContactEmail(), a.getNextAction(), a.getFollowUpDate(), due,
                a.getNotes());
    }
}