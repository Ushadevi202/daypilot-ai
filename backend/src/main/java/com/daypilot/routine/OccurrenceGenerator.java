package com.daypilot.routine;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OccurrenceGenerator {

    public static final int HORIZON_DAYS = 14;

    private final RoutineRepository routineRepository;
    private final RoutineOccurrenceRepository occurrenceRepository;

    public OccurrenceGenerator(RoutineRepository routineRepository,
                               RoutineOccurrenceRepository occurrenceRepository) {
        this.routineRepository = routineRepository;
        this.occurrenceRepository = occurrenceRepository;
    }

    /** Creates any missing occurrences for one routine. Safe to call repeatedly. */
    @Transactional
    public int generate(Routine routine, LocalDate from, LocalDate to) {
        if (!routine.isActive() || from.isAfter(to)) {
            return 0;
        }
        Set<LocalDate> existing = new HashSet<>(
                occurrenceRepository.findExistingDates(routine.getId(), from, to));
        int attempted = 0;
        for (LocalDate day = from; !day.isAfter(to); day = day.plusDays(1)) {
            if (existing.contains(day) || !routine.occursOn(day)) {
                continue;
            }
            occurrenceRepository.insertIfAbsent(routine.getUserId(), routine.getId(), day,
                    routine.getTitle(), routine.getDescription(), routine.getStartTime(),
                    routine.getEndTime(), routine.getEstimatedMinutes());
            attempted++;
        }
        return attempted;
    }

    @Transactional
    public int generateForUser(Long userId, LocalDate from, LocalDate to) {
        int total = 0;
        for (Routine routine : routineRepository.findByUserIdOrderByStartTimeAsc(userId)) {
            total += generate(routine, from, to);
        }
        return total;
    }
}