package com.daypilot.routine;

import java.time.Duration;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.daypilot.common.ApiException;
import com.daypilot.routine.dto.RoutineRequest;
import com.daypilot.routine.dto.RoutineResponse;

@Service
public class RoutineService {

    private final RoutineRepository routineRepository;
    private final OccurrenceService occurrenceService;

    public RoutineService(RoutineRepository routineRepository, OccurrenceService occurrenceService) {
        this.routineRepository = routineRepository;
        this.occurrenceService = occurrenceService;
    }

    @Transactional(readOnly = true)
    public List<RoutineResponse> list(Long userId) {
        return routineRepository.findByUserIdOrderByStartTimeAsc(userId)
                .stream().map(RoutineResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public RoutineResponse get(Long userId, Long id) {
        return RoutineResponse.from(findOwned(userId, id));
    }

    @Transactional
    public RoutineResponse create(Long userId, RoutineRequest request) {
        validate(request);
        Routine routine = new Routine(userId);
        apply(routine, request);
        Routine saved = routineRepository.save(routine);
        occurrenceService.refreshAfterRoutineChange(saved);
        return RoutineResponse.from(saved);
    }

    @Transactional
    public RoutineResponse update(Long userId, Long id, RoutineRequest request) {
        validate(request);
        Routine routine = findOwned(userId, id);
        apply(routine, request);
        occurrenceService.refreshAfterRoutineChange(routine);
        return RoutineResponse.from(routine);
    }

    @Transactional
    public RoutineResponse setActive(Long userId, Long id, boolean active) {
        Routine routine = findOwned(userId, id);
        routine.setActive(active);
        occurrenceService.refreshAfterRoutineChange(routine);
        return RoutineResponse.from(routine);
    }

    @Transactional
    public void delete(Long userId, Long id) {
        Routine routine = findOwned(userId, id);
        occurrenceService.deleteFuturePending(routine);
        routineRepository.delete(routine);
    }

    private Routine findOwned(Long userId, Long id) {
        return routineRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Routine not found"));
    }

    private void validate(RoutineRequest r) {
        if (!r.endTime().isAfter(r.startTime())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }
        if (r.recurrenceType() == RecurrenceType.WEEKLY
                && (r.daysOfWeek() == null || r.daysOfWeek().isEmpty())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Choose at least one weekday for a weekly routine");
        }
        if (r.endDate() != null && r.endDate().isBefore(r.startDate())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "End date must not be before start date");
        }
    }

    private void apply(Routine routine, RoutineRequest r) {
        routine.setTitle(r.title().trim());
        routine.setDescription(r.description() == null || r.description().isBlank() ? null : r.description().trim());
        routine.setStartTime(r.startTime());
        routine.setEndTime(r.endTime());
        routine.setEstimatedMinutes(r.estimatedMinutes() != null
                ? r.estimatedMinutes()
                : (int) Duration.between(r.startTime(), r.endTime()).toMinutes());
        routine.setRecurrence(r.recurrenceType(), r.daysOfWeek());
        routine.setStartDate(r.startDate());
        routine.setEndDate(r.endDate());
    }
}