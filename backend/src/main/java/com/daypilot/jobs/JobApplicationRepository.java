package com.daypilot.jobs;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    Optional<JobApplication> findByIdAndUserId(Long id, Long userId);

    @Query("""
            select a from JobApplication a
            where a.userId = :userId
              and a.status in :statuses
              and (lower(a.company) like :q or lower(a.jobTitle) like :q)
              and (:followUpDue = false or (a.followUpDate is not null and a.followUpDate <= :today
                   and a.status in ('APPLIED', 'ASSESSMENT', 'INTERVIEW', 'ON_HOLD')))
            order by a.statusChangedAt desc, a.id desc
            """)
    List<JobApplication> search(@Param("userId") Long userId,
                                @Param("statuses") List<String> statuses,
                                @Param("q") String q,
                                @Param("followUpDue") boolean followUpDue,
                                @Param("today") LocalDate today);
}