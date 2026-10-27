package com.daypilot.settings;

import java.time.ZoneId;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.daypilot.auth.dto.UserResponse;
import com.daypilot.common.ApiException;
import com.daypilot.user.User;
import com.daypilot.user.UserRepository;

@Service
public class SettingsService {

    private final UserRepository userRepository;

    public SettingsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public UserResponse updateTimezone(Long userId, String timezone) {
        String tz = timezone.trim();
        if (!ZoneId.getAvailableZoneIds().contains(tz)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unknown timezone: " + tz);
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Session is no longer valid"));
        user.setTimezone(tz); // saved automatically when the transaction commits
        return UserResponse.from(user);
    }
}