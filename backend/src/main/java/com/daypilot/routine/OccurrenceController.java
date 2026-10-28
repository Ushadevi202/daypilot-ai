package com.daypilot.routine;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.daypilot.routine.dto.OccurrenceResponse;
import com.daypilot.routine.dto.RescheduleRequest;
import com.daypilot.routine.dto.StatusRequest;
import com.daypilot.security.AuthUser;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/occurrences")
public class OccurrenceController {

    private final OccurrenceService occurrenceService;

    public OccurrenceController(OccurrenceService occurrenceService) {
        this.occurrenceService = occurrenceService;
    }

    // No dates = today. Past ranges show your completion history.
    @GetMapping
    public List<OccurrenceResponse> list(
            @AuthenticationPrincipal AuthUser user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return occurrenceService.list(user.getId(), from, to);
    }

    @PutMapping("/{id}/status")
    public OccurrenceResponse setStatus(@AuthenticationPrincipal AuthUser user, @PathVariable Long id,
                                        @Valid @RequestBody StatusRequest request) {
        return occurrenceService.setStatus(user.getId(), id, request.status());
    }

    @PutMapping("/{id}/reschedule")
    public OccurrenceResponse reschedule(@AuthenticationPrincipal AuthUser user, @PathVariable Long id,
                                         @Valid @RequestBody RescheduleRequest request) {
        return occurrenceService.reschedule(user.getId(), id, request.startTime(), request.endTime());
    }
}