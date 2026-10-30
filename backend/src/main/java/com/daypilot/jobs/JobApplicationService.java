package com.daypilot.jobs;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.daypilot.common.ApiException;
import com.daypilot.jobs.dto.EventRequest;
import com.daypilot.jobs.dto.JobApplicationRequest;
import com.daypilot.jobs.dto.JobApplicationResponse;
import com.daypilot.jobs.dto.JobEventResponse;
import com.daypilot.jobs.dto.UpcomingEventResponse;
import com.daypilot.user.UserTime;

@Service
public class JobApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final JobEventRepository eventRepository;
    private final UserTime userTime;

    public JobApplicationService(JobApplicationRepository applicationRepository,
                                 JobEventRepository eventRepository, UserTime userTime) {
        this.applicationRepository = applicationRepository;
        this.eventRepository = eventRepository;
        this.userTime = userTime;
    }

    @Transactional(readOnly = true)
    public List<JobApplicationResponse> list(Long userId, ApplicationStatus status, String q, boolean followUpDue) {
        LocalDate today = userTime.today(userId);
        List<String> statuses = status == null
                ? Arrays.stream(ApplicationStatus.values()).map(Enum::name).toList()
                : List.of(status.name());
        String pattern = (q == null || q.isBlank()) ? "%" : "%" + q.trim().toLowerCase() + "%";
        return applicationRepository.search(userId, statuses, pattern, followUpDue, today)
                .stream().map(a -> JobApplicationResponse.from(a, today)).toList();
    }

    @Transactional(readOnly = true)
    public JobApplicationResponse get(Long userId, Long id) {
        return respond(findOwned(userId, id));
    }

    @Transactional
    public JobApplicationResponse create(Long userId, JobApplicationRequest request) {
        validate(request);
        JobApplication application = new JobApplication(userId);
        apply(application, request);

        ApplicationStatus status = request.status() != null ? request.status() : ApplicationStatus.APPLIED;
        application.changeStatus(status);
        if (request.appliedDate() == null && status != ApplicationStatus.INTERESTED) {
            application.setAppliedDate(userTime.today(userId));
        }
        applicationRepository.save(application);
        logEvent(application, JobEventType.STATUS_CHANGE, null, null, "Added as " + status);
        return respond(application);
    }

    // Edits the details only. The status is changed with changeStatus(), so the history stays clear.
    @Transactional
    public JobApplicationResponse update(Long userId, Long id, JobApplicationRequest request) {
        validate(request);
        JobApplication application = findOwned(userId, id);
        apply(application, request);
        return respond(application);
    }

    @Transactional
    public JobApplicationResponse changeStatus(Long userId, Long id, ApplicationStatus newStatus) {
        JobApplication application = findOwned(userId, id);
        ApplicationStatus oldStatus = application.getStatus();
        if (oldStatus != newStatus) {
            application.changeStatus(newStatus);
            if (newStatus == ApplicationStatus.APPLIED && application.getAppliedDate() == null) {
                application.setAppliedDate(userTime.today(userId));
            }
            logEvent(application, JobEventType.STATUS_CHANGE, null, null, oldStatus + " -> " + newStatus);
        }
        return respond(application);
    }

    @Transactional
    public void delete(Long userId, Long id) {
        applicationRepository.delete(findOwned(userId, id)); // events are removed by the database
    }

    @Transactional(readOnly = true)
    public List<JobEventResponse> events(Long userId, Long id) {
        findOwned(userId, id); // gives 404 for someone else's application
        return eventRepository.findByJobApplicationIdAndUserIdOrderByCreatedAtDescIdDesc(id, userId)
                .stream().map(JobEventResponse::from).toList();
    }

    @Transactional
    public JobEventResponse addEvent(Long userId, Long id, EventRequest request) {
        JobApplication application = findOwned(userId, id);
        if (request.type() == JobEventType.STATUS_CHANGE) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Status changes are recorded automatically");
        }
        if (request.type().isScheduled() && request.eventDate() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Choose a date for this type of event");
        }
        if (request.eventTime() != null && request.eventDate() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Choose a date when you set a time");
        }
        return JobEventResponse.from(logEvent(application, request.type(), request.eventDate(),
                request.eventTime(), blankToNull(request.details())));
    }

    @Transactional(readOnly = true)
    public List<UpcomingEventResponse> upcoming(Long userId, int days) {
        int range = Math.max(1, Math.min(days, 60));
        LocalDate today = userTime.today(userId);
        List<String> types = Arrays.stream(JobEventType.values())
                .filter(JobEventType::isScheduled).map(Enum::name).toList();
        List<JobEvent> events = eventRepository.findScheduled(userId, today, today.plusDays(range), types);

        Map<Long, JobApplication> applications = applicationRepository
                .findAllById(events.stream().map(JobEvent::getJobApplicationId).distinct().toList())
                .stream().filter(a -> a.getUserId().equals(userId))
                .collect(Collectors.toMap(JobApplication::getId, Function.identity()));

        return events.stream()
                .filter(e -> applications.containsKey(e.getJobApplicationId()))
                .map(e -> {
                    JobApplication a = applications.get(e.getJobApplicationId());
                    return new UpcomingEventResponse(a.getId(), a.getCompany(), a.getJobTitle(), e.getType(),
                            e.getEventDate(), e.getEventTime(), e.getDetails());
                }).toList();
    }

    // --- helpers ---

    private JobApplication findOwned(Long userId, Long id) {
        return applicationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Application not found"));
    }

    private JobApplicationResponse respond(JobApplication a) {
        return JobApplicationResponse.from(a, userTime.today(a.getUserId()));
    }

    private JobEvent logEvent(JobApplication a, JobEventType type, LocalDate date, LocalTime time, String details) {
        return eventRepository.save(new JobEvent(a.getId(), a.getUserId(), type, date, time, details, "MANUAL"));
    }

    private void validate(JobApplicationRequest r) {
        String url = blankToNull(r.jobUrl());
        if (url != null && !(url.startsWith("http://") || url.startsWith("https://"))) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "The job link must start with http:// or https://");
        }
    }

    private void apply(JobApplication a, JobApplicationRequest r) {
        a.setCompany(r.company().trim());
        a.setJobTitle(r.jobTitle().trim());
        a.setJobUrl(blankToNull(r.jobUrl()));
        a.setLocation(blankToNull(r.location()));
        a.setEmploymentType(r.employmentType());
        a.setSource(blankToNull(r.source()));
        a.setAppliedDate(r.appliedDate());
        a.setResumeNotes(blankToNull(r.resumeNotes()));
        a.setContactName(blankToNull(r.contactName()));
        a.setContactEmail(blankToNull(r.contactEmail()));
        a.setNextAction(blankToNull(r.nextAction()));
        a.setFollowUpDate(r.followUpDate());
        a.setNotes(blankToNull(r.notes()));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}