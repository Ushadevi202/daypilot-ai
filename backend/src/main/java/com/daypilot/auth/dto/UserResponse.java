package com.daypilot.auth.dto;

import com.daypilot.user.User;

public record UserResponse(Long id, String email, String timezone) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getTimezone());
    }
}