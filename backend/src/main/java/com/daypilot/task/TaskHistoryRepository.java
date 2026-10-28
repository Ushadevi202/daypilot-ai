package com.daypilot.task;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskHistoryRepository extends JpaRepository<TaskHistory, Long> {

    List<TaskHistory> findByTaskIdAndUserIdOrderByCreatedAtDescIdDesc(Long taskId, Long userId);
}