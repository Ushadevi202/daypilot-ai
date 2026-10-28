package com.daypilot.routine;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RoutineOccurrenceRepository extends JpaRepository<RoutineOccurrence, Long> {

    List<RoutineOccurrence> findByUserIdAndOccurrenceDateBetweenOrderByOccurrenceDateAscStartTimeAsc(
            Long userId, LocalDate from, LocalDate to);

    Optional<RoutineOccurrence> findByIdAndUserId(Long id, Long userId);

    List<RoutineOccurrence> findByRoutineIdAndOccurrenceDateGreaterThanEqualAndStatus(
            Long routineId, LocalDate from, String status);

    @Query("select o.occurrenceDate from RoutineOccurrence o "
            + "where o.routineId = :routineId and o.occurrenceDate between :from and :to")
    List<LocalDate> findExistingDates(@Param("routineId") Long routineId,
                                      @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Modifying
    @Query("update RoutineOccurrence o set o.status = 'MISSED' "
            + "where o.userId = :userId and o.status = 'PENDING' and o.occurrenceDate < :today")
    int markMissed(@Param("userId") Long userId, @Param("today") LocalDate today);

    @Modifying
    @Query("delete from RoutineOccurrence o "
            + "where o.routineId = :routineId and o.status = 'PENDING' and o.occurrenceDate >= :from")
    int deleteFuturePending(@Param("routineId") Long routineId, @Param("from") LocalDate from);

    // The unique key (routine_id, occurrence_date) makes this safe to repeat or to run concurrently.
    @Modifying
    @Query(value = """
            INSERT INTO routine_occurrences
                (user_id, routine_id, occurrence_date, title, description,
                 start_time, end_time, estimated_minutes, status)
            VALUES
                (:userId, :routineId, :date, :title, :description,
                 :startTime, :endTime, :minutes, 'PENDING')
            ON DUPLICATE KEY UPDATE id = id
            """, nativeQuery = true)
    int insertIfAbsent(@Param("userId") Long userId, @Param("routineId") Long routineId,
                       @Param("date") LocalDate date, @Param("title") String title,
                       @Param("description") String description,
                       @Param("startTime") LocalTime startTime, @Param("endTime") LocalTime endTime,
                       @Param("minutes") int minutes);
}