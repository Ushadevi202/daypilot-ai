package com.daypilot.task;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.daypilot.common.ApiException;
import com.daypilot.task.dto.HistoryResponse;
import com.daypilot.task.dto.TaskRequest;
import com.daypilot.task.dto.TaskResponse;
import com.daypilot.user.UserTime;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskHistoryRepository historyRepository;
    private final UserTime userTime;

    public TaskService(TaskRepository taskRepository, TaskHistoryRepository historyRepository,
                       UserTime userTime) {
        this.taskRepository = taskRepository;
        this.historyRepository = historyRepository;
        this.userTime = userTime;
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> list(Long userId, TaskStatus status, TaskPriority priority, String category,
                                   LocalDate dueFrom, LocalDate dueTo, boolean overdue, String q) {
        LocalDate today = userTime.today(userId);
        List<String> statuses = status == null
                ? List.of(TaskStatus.PENDING.name(), TaskStatus.COMPLETED.name()) : List.of(status.name());
        List<String> priorities = priority == null
                ? List.of(TaskPriority.LOW.name(), TaskPriority.MEDIUM.name(), TaskPriority.HIGH.name())
                : List.of(priority.name());
        String cat = category == null ? "" : category.trim();
        boolean useDates = dueFrom != null || dueTo != null;
        LocalDate from = dueFrom != null ? dueFrom : LocalDate.of(1900, 1, 1);
        LocalDate to = dueTo != null ? dueTo : LocalDate.of(9999, 12, 31);
        String pattern = (q == null || q.isBlank()) ? "%" : "%" + q.trim().toLowerCase() + "%";

        return taskRepository.search(userId, statuses, priorities, cat, useDates, from, to, overdue, today, pattern)
                .stream().map(t -> TaskResponse.from(t, today)).toList();
    }

    @Transactional(readOnly = true)
    public TaskResponse get(Long userId, Long id) {
        return respond(findOwned(userId, id));
    }

    @Transactional
    public TaskResponse create(Long userId, TaskRequest request) {
        validate(request);
        Task task = new Task(userId);
        apply(task, request);
        taskRepository.save(task);
        log(task, "CREATED", "Task created");
        return respond(task);
    }

    @Transactional
    public TaskResponse update(Long userId, Long id, TaskRequest request) {
        validate(request);
        Task task = findOwned(userId, id);

        String oldTitle = task.getTitle();
        TaskPriority oldPriority = task.getPriority();
        String oldCategory = task.getCategory();
        LocalDate oldDue = task.getDueDate();
        LocalTime oldTime = task.getScheduledTime();
        Integer oldMinutes = task.getEstimatedMinutes();
        String oldDescription = task.getDescription();
        String oldNotes = task.getNotes();

        apply(task, request);

        List<String> changes = new ArrayList<>();
        addChange(changes, "title", oldTitle, task.getTitle());
        addChange(changes, "priority", oldPriority, task.getPriority());
        addChange(changes, "category", oldCategory, task.getCategory());
        addChange(changes, "due", oldDue, task.getDueDate());
        addChange(changes, "time", oldTime, task.getScheduledTime());
        addChange(changes, "minutes", oldMinutes, task.getEstimatedMinutes());
        if (!Objects.equals(oldDescription, task.getDescription())) {
            changes.add("description changed");
        }
        if (!Objects.equals(oldNotes, task.getNotes())) {
            changes.add("notes changed");
        }
        if (!changes.isEmpty()) {
            log(task, "UPDATED", String.join("; ", changes));
        }
        return respond(task);
    }

    @Transactional
    public TaskResponse complete(Long userId, Long id) {
        Task task = findOwned(userId, id);
        if (task.getStatus() != TaskStatus.COMPLETED) {
            task.markCompleted();
            log(task, "COMPLETED", "Marked complete");
        }
        return respond(task);
    }

    @Transactional
    public TaskResponse reopen(Long userId, Long id) {
        Task task = findOwned(userId, id);
        if (task.getStatus() == TaskStatus.COMPLETED) {
            task.reopen();
            log(task, "REOPENED", "Marked pending again");
        }
        return respond(task);
    }

    @Transactional
    public TaskResponse postpone(Long userId, Long id, LocalDate newDate, LocalTime newTime) {
        Task task = findOwned(userId, id);
        if (task.getStatus() == TaskStatus.COMPLETED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "A completed task cannot be postponed. Reopen it first.");
        }
        LocalDate oldDate = task.getDueDate();
        if (oldDate != null && !newDate.isAfter(oldDate)) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "New due date must be after the current due date (" + oldDate + "). Use edit to move a task earlier.");
        }
        task.postponeTo(newDate, newTime);
        log(task, "POSTPONED", "Due " + (oldDate == null ? "none" : oldDate) + " -> " + newDate);
        return respond(task);
    }

    @Transactional(readOnly = true)
    public List<HistoryResponse> history(Long userId, Long id) {
        findOwned(userId, id); // gives 404 if the task belongs to someone else
        return historyRepository.findByTaskIdAndUserIdOrderByCreatedAtDescIdDesc(id, userId)
                .stream().map(HistoryResponse::from).toList();
    }

    @Transactional
    public void delete(Long userId, Long id) {
        taskRepository.delete(findOwned(userId, id)); // history rows are removed by the database
    }

    // --- helpers ---

    private Task findOwned(Long userId, Long id) {
        return taskRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Task not found"));
    }

    private TaskResponse respond(Task task) {
        return TaskResponse.from(task, userTime.today(task.getUserId()));
    }

    private void validate(TaskRequest r) {
        if (r.scheduledTime() != null && r.dueDate() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Choose a due date when you set a scheduled time");
        }
    }

    private void apply(Task task, TaskRequest r) {
        task.setTitle(r.title().trim());
        task.setDescription(blankToNull(r.description()));
        task.setCategory(blankToNull(r.category()));
        task.setPriority(r.priority() != null ? r.priority() : TaskPriority.MEDIUM);
        task.setDueDate(r.dueDate());
        task.setScheduledTime(r.scheduledTime());
        task.setEstimatedMinutes(r.estimatedMinutes());
        task.setNotes(blankToNull(r.notes()));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private void addChange(List<String> changes, String field, Object before, Object after) {
        if (!Objects.equals(before, after)) {
            changes.add(field + ": " + (before == null ? "none" : before) + " -> " + (after == null ? "none" : after));
        }
    }

    private void log(Task task, String action, String details) {
        String text = details.length() > 500 ? details.substring(0, 497) + "..." : details;
        historyRepository.save(new TaskHistory(task.getId(), task.getUserId(), action, text));
    }
}