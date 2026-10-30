package com.daypilot.jobs;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.daypilot.jobs.dto.EventRequest;
import com.daypilot.jobs.dto.JobApplicationRequest;
import com.daypilot.jobs.dto.JobApplicationResponse;
import com.daypilot.jobs.dto.JobEventResponse;
import com.daypilot.jobs.dto.StatusRequest;
import com.daypilot.jobs.dto.UpcomingEventResponse;
import com.daypilot.security.AuthUser;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {

    private final JobApplicationService service;

    public JobApplicationController(JobApplicationService service) {
        this.service = service;
    }

    @GetMapping
    public List<JobApplicationResponse> list(@AuthenticationPrincipal AuthUser user,
                                             @RequestParam(required = false) ApplicationStatus status,
                                             @RequestParam(required = false) String q,
                                             @RequestParam(defaultValue = "false") boolean followUpDue) {
        return service.list(user.getId(), status, q, followUpDue);
    }

    @GetMapping("/upcoming")
    public List<UpcomingEventResponse> upcoming(@AuthenticationPrincipal AuthUser user,
                                                @RequestParam(defaultValue = "14") int days) {
        return service.upcoming(user.getId(), days);
    }

    @GetMapping("/{id}")
    public JobApplicationResponse get(@AuthenticationPrincipal AuthUser user, @PathVariable Long id) {
        return service.get(user.getId(), id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public JobApplicationResponse create(@AuthenticationPrincipal AuthUser user,
                                         @Valid @RequestBody JobApplicationRequest request) {
        return service.create(user.getId(), request);
    }

    @PutMapping("/{id}")
    public JobApplicationResponse update(@AuthenticationPrincipal AuthUser user, @PathVariable Long id,
                                         @Valid @RequestBody JobApplicationRequest request) {
        return service.update(user.getId(), id, request);
    }

    @PutMapping("/{id}/status")
    public JobApplicationResponse changeStatus(@AuthenticationPrincipal AuthUser user, @PathVariable Long id,
                                               @Valid @RequestBody StatusRequest request) {
        return service.changeStatus(user.getId(), id, request.status());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal AuthUser user, @PathVariable Long id) {
        service.delete(user.getId(), id);
    }

    @GetMapping("/{id}/events")
    public List<JobEventResponse> events(@AuthenticationPrincipal AuthUser user, @PathVariable Long id) {
        return service.events(user.getId(), id);
    }

    @PostMapping("/{id}/events")
    @ResponseStatus(HttpStatus.CREATED)
    public JobEventResponse addEvent(@AuthenticationPrincipal AuthUser user, @PathVariable Long id,
                                     @Valid @RequestBody EventRequest request) {
        return service.addEvent(user.getId(), id, request);
    }
}