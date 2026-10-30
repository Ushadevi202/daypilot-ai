package com.daypilot.jobs.dto;

import java.time.LocalDate;

import com.daypilot.jobs.ApplicationStatus;
import com.daypilot.jobs.EmploymentType;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record JobApplicationRequest(
        @NotBlank @Size(max = 150) String company,
        @NotBlank @Size(max = 150) String jobTitle,
        @Size(max = 500) String jobUrl,
        @Size(max = 150) String location,
        EmploymentType employmentType,
        @Size(max = 100) String source,
        ApplicationStatus status,
        LocalDate appliedDate,
        @Size(max = 500) String resumeNotes,
        @Size(max = 150) String contactName,
        @Email @Size(max = 255) String contactEmail,
        @Size(max = 255) String nextAction,
        LocalDate followUpDate,
        @Size(max = 2000) String notes) {
}