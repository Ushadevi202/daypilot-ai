package com.daypilot.jobs;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface JobEventRepository extends JpaRepository<JobEvent, Long> {

    List<JobEvent> findByJobApplicationIdAndUserIdOrderByCreatedAtDescIdDesc(Long jobApplicationId, Long userId);

    @Query("""
            select e from JobEvent e
            where e.userId = :userId
              and e.eventDate >= :from and e.eventDate <= :to
              and e.type in :types
            order by e.eventDate, e.eventTime, e.id
            """)
    List<JobEvent> findScheduled(@Param("userId") Long userId, @Param("from") LocalDate from,
                                 @Param("to") LocalDate to, @Param("types") List<String> types);
}