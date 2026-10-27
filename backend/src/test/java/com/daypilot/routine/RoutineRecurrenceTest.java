package com.daypilot.routine;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Set;

import org.junit.jupiter.api.Test;

class RoutineRecurrenceTest {

    private Routine routine(RecurrenceType type, Set<DayOfWeek> days, LocalDate start, LocalDate end) {
        Routine r = new Routine(1L);
        r.setRecurrence(type, days);
        r.setStartDate(start);
        r.setEndDate(end);
        return r;
    }

    @Test
    void dailyRoutineOccursEveryDayInsideItsDateRange() {
        Routine r = routine(RecurrenceType.DAILY, null, LocalDate.of(2026, 10, 27), LocalDate.of(2026, 10, 30));
        assertFalse(r.occursOn(LocalDate.of(2026, 10, 26)));
        assertTrue(r.occursOn(LocalDate.of(2026, 10, 27)));
        assertTrue(r.occursOn(LocalDate.of(2026, 10, 30)));
        assertFalse(r.occursOn(LocalDate.of(2026, 10, 31)));
    }

    @Test
    void weeklyRoutineOccursOnlyOnChosenWeekdays() {
        Routine r = routine(RecurrenceType.WEEKLY, Set.of(DayOfWeek.MONDAY, DayOfWeek.FRIDAY),
                LocalDate.of(2026, 10, 1), null);
        assertTrue(r.occursOn(LocalDate.of(2026, 10, 26)));   // Monday
        assertFalse(r.occursOn(LocalDate.of(2026, 10, 27)));  // Tuesday
        assertTrue(r.occursOn(LocalDate.of(2026, 10, 30)));   // Friday
    }

    @Test
    void routineWithNoEndDateKeepsRepeating() {
        Routine r = routine(RecurrenceType.DAILY, null, LocalDate.of(2026, 10, 27), null);
        assertTrue(r.occursOn(LocalDate.of(2027, 12, 31)));
    }
}