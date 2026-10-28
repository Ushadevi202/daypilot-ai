package com.daypilot.routine;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.daypilot.common.ApiException;
import com.daypilot.routine.dto.OccurrenceResponse;
import com.daypilot.user.UserTime;

@Service
public class OccurrenceService {

    private static final int MAX_RANGE_DAYS = 62;
    private static final int GENERATE_AHEAD_DAYS = 60;

    private final RoutineOccurrenceRepository occurrenceRepository;
    private final OccurrenceGenerator generator;
    private final UserTime userTime;

    public OccurrenceService(RoutineOccurrenceRepository occurrenceRepository,
                             OccurrenceGenerator generator, UserTime userTime) {
        this.occurrenceRepository = occurrenceRepository;
        this.generator = generator;
        this.userTime = userTime;
    }

    /** Lists a date range. Past PENDING items become MISSED and missing future days are generated first. */
    @Transactional
    public List<OccurrenceResponse> list(Long userId, LocalDate from, LocalDate to) {
        LocalDate today = userTime.today(userId);
        LocalDate start = from != null ? from : today;
        LocalDate end = to != null ? to : start;
        if (end.isBefore(start)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "'to' must not be before 'from'");
        }
        if (ChronoUnit.DAYS.between(start, end) > MAX_RANGE_DAYS) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Date range is too large (maximum 62 days)");
        }

        occurrenceRepository.markMissed(userId, today);

        LocalDate generateFrom = start.isBefore(today) ? today : start;
        LocalDate limit = today.plusDays(GENERATE_AHEAD_DAYS);
        LocalDate generateTo = end.isAfter(limit) ? limit : end;
        generator.generateForUser(userId, generateFrom, generateTo);

        return occurrenceRepository
                .findByUserIdAndOccurrenceDateBetweenOrderByOccurrenceDateAscStartTimeAsc(userId, start, end)
                .stream().map(OccurrenceResponse::from).toList();
    }

    @Transactional
    public OccurrenceResponse setStatus(Long userId, Long id, OccurrenceStatus status) {
        RoutineOccurrence occurrence = findOwned(userId, id);
        boolean future = occurrence.getOccurrenceDate().isAfter(userTime.today(userId));
        if (future && (status == OccurrenceStatus.COMPLETED || status == OccurrenceStatus.MISSED)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "A future occurrence cannot be marked " + status);
        }
        occurrence.changeStatus(status);
        return OccurrenceResponse.from(occurrence);
    }

    @Transactional
    public OccurrenceResponse reschedule(Long userId, Long id, LocalTime start, LocalTime end) {
        if (!end.isAfter(start)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }
        RoutineOccurrence occurrence = findOwned(userId, id);
        if (occurrence.getStatus() != OccurrenceStatus.PENDING) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only pending occurrences can be rescheduled");
        }
        occurrence.reschedule(start, end, (int) Duration.between(start, end).toMinutes());
        return OccurrenceResponse.from(occurrence);
    }

    @Transactional
    public void markMissed(Long userId, LocalDate today) {
        occurrenceRepository.markMissed(userId, today);
    }

    /**
     * Called after a routine is created, edited, enabled or disabled.
     * Only future PENDING occurrences change. Completed, skipped, missed and past rows are history.
     */
    @Transactional
    public void refreshAfterRoutineChange(Routine routine) {
        LocalDate today = userTime.today(routine.getUserId());
        List<RoutineOccurrence> future = occurrenceRepository
                .findByRoutineIdAndOccurrenceDateGreaterThanEqualAndStatus(
                        routine.getId(), today, OccurrenceStatus.PENDING.name());
        for (RoutineOccurrence occurrence : future) {
            if (!routine.isActive() || !routine.occursOn(occurrence.getOccurrenceDate())) {
                occurrenceRepository.delete(occurrence);
            } else if (!occurrence.isCustomized()) {
                occurrence.copySnapshotFrom(routine);
            }
        }
        generator.generate(routine, today, today.plusDays(OccurrenceGenerator.HORIZON_DAYS));
    }

    /** Called before a routine is deleted. Earlier occurrences stay as history. */
    @Transactional
    public void deleteFuturePending(Routine routine) {
        occurrenceRepository.deleteFuturePending(routine.getId(), userTime.today(routine.getUserId()));
    }

    private RoutineOccurrence findOwned(Long userId, Long id) {
        return occurrenceRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Occurrence not found"));
    }
}