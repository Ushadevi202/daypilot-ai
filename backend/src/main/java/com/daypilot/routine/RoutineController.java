package com.daypilot.routine;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.daypilot.routine.dto.ActiveRequest;
import com.daypilot.routine.dto.RoutineRequest;
import com.daypilot.routine.dto.RoutineResponse;
import com.daypilot.security.AuthUser;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/routines")
public class RoutineController {

    private final RoutineService routineService;

    public RoutineController(RoutineService routineService) {
        this.routineService = routineService;
    }

    @GetMapping
    public List<RoutineResponse> list(@AuthenticationPrincipal AuthUser user) {
        return routineService.list(user.getId());
    }

    @GetMapping("/{id}")
    public RoutineResponse get(@AuthenticationPrincipal AuthUser user, @PathVariable Long id) {
        return routineService.get(user.getId(), id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RoutineResponse create(@AuthenticationPrincipal AuthUser user,
                                  @Valid @RequestBody RoutineRequest request) {
        return routineService.create(user.getId(), request);
    }

    @PutMapping("/{id}")
    public RoutineResponse update(@AuthenticationPrincipal AuthUser user, @PathVariable Long id,
                                  @Valid @RequestBody RoutineRequest request) {
        return routineService.update(user.getId(), id, request);
    }

    @PutMapping("/{id}/active")
    public RoutineResponse setActive(@AuthenticationPrincipal AuthUser user, @PathVariable Long id,
                                     @Valid @RequestBody ActiveRequest request) {
        return routineService.setActive(user.getId(), id, request.active());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal AuthUser user, @PathVariable Long id) {
        routineService.delete(user.getId(), id);
    }
}