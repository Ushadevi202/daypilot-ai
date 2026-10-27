package com.daypilot.settings;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.daypilot.auth.dto.UserResponse;
import com.daypilot.security.AuthUser;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    // The user id comes from the logged-in session, never from the request,
    // so one user can never change another user's settings.
    @PutMapping
    public UserResponse update(@AuthenticationPrincipal AuthUser principal,
                               @Valid @RequestBody UpdateSettingsRequest request) {
        return settingsService.updateTimezone(principal.getId(), request.timezone());
    }
}