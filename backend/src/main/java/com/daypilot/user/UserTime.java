package com.daypilot.user;

import java.time.LocalDate;
import java.time.ZoneId;

import org.springframework.stereotype.Component;

@Component
public class UserTime {

    private static final String DEFAULT_TIMEZONE = "Asia/Kolkata";

    private final UserRepository userRepository;

    public UserTime(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public LocalDate today(Long userId) {
        String tz = userRepository.findById(userId).map(User::getTimezone).orElse(DEFAULT_TIMEZONE);
        return LocalDate.now(ZoneId.of(tz));
    }

    public LocalDate today(User user) {
        return LocalDate.now(ZoneId.of(user.getTimezone()));
    }
}