package com.daypilot.routine;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RoutineRepository extends JpaRepository<Routine, Long> {

    List<Routine> findByUserIdOrderByStartTimeAsc(Long userId);

    // Always look up by id AND owner, so users can never reach each other's data.
    Optional<Routine> findByIdAndUserId(Long id, Long userId);
}