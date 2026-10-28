package com.daypilot.task;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskRepository extends JpaRepository<Task, Long> {

    Optional<Task> findByIdAndUserId(Long id, Long userId);

    @Query("""
            select t from Task t
            where t.userId = :userId
              and t.status in :statuses
              and t.priority in :priorities
              and (:category = '' or t.category = :category)
              and (:useDates = false or (t.dueDate >= :dueFrom and t.dueDate <= :dueTo))
              and (:overdue = false or (t.status = 'PENDING' and t.dueDate < :today))
              and lower(t.title) like :q
            order by case when t.dueDate is null then 1 else 0 end, t.dueDate, t.scheduledTime, t.id
            """)
    List<Task> search(@Param("userId") Long userId,
                      @Param("statuses") List<String> statuses,
                      @Param("priorities") List<String> priorities,
                      @Param("category") String category,
                      @Param("useDates") boolean useDates,
                      @Param("dueFrom") LocalDate dueFrom,
                      @Param("dueTo") LocalDate dueTo,
                      @Param("overdue") boolean overdue,
                      @Param("today") LocalDate today,
                      @Param("q") String q);
}