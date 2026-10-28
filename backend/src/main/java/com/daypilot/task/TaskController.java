package com.daypilot.task;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.daypilot.security.AuthUser;
import com.daypilot.task.dto.HistoryResponse;
import com.daypilot.task.dto.PostponeRequest;
import com.daypilot.task.dto.TaskRequest;
import com.daypilot.task.dto.TaskResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public List<TaskResponse> list(
            @AuthenticationPrincipal AuthUser user,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) TaskPriority priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueTo,
            @RequestParam(defaultValue = "false") boolean overdue,
            @RequestParam(required = false) String q) {
        return taskService.list(user.getId(), status, priority, category, dueFrom, dueTo, overdue, q);
    }

    @GetMapping("/{id}")
    public TaskResponse get(@AuthenticationPrincipal AuthUser user, @PathVariable Long id) {
        return taskService.get(user.getId(), id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse create(@AuthenticationPrincipal AuthUser user, @Valid @RequestBody TaskRequest request) {
        return taskService.create(user.getId(), request);
    }

    @PutMapping("/{id}")
    public TaskResponse update(@AuthenticationPrincipal AuthUser user, @PathVariable Long id,
                               @Valid @RequestBody TaskRequest request) {
        return taskService.update(user.getId(), id, request);
    }

    @PutMapping("/{id}/complete")
    public TaskResponse complete(@AuthenticationPrincipal AuthUser user, @PathVariable Long id) {
        return taskService.complete(user.getId(), id);
    }

    @PutMapping("/{id}/reopen")
    public TaskResponse reopen(@AuthenticationPrincipal AuthUser user, @PathVariable Long id) {
        return taskService.reopen(user.getId(), id);
    }

    @PutMapping("/{id}/postpone")
    public TaskResponse postpone(@AuthenticationPrincipal AuthUser user, @PathVariable Long id,
                                 @Valid @RequestBody PostponeRequest request) {
        return taskService.postpone(user.getId(), id, request.dueDate(), request.scheduledTime());
    }

    @GetMapping("/{id}/history")
    public List<HistoryResponse> history(@AuthenticationPrincipal AuthUser user, @PathVariable Long id) {
        return taskService.history(user.getId(), id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal AuthUser user, @PathVariable Long id) {
        taskService.delete(user.getId(), id);
    }
}