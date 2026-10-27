package com.daypilot.auth;

import java.time.ZoneId;
import java.util.Locale;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.daypilot.auth.dto.RegisterRequest;
import com.daypilot.auth.dto.UserResponse;
import com.daypilot.common.ApiException;
import com.daypilot.user.User;
import com.daypilot.user.UserRepository;

@Service
public class AuthService {

    private static final String DEFAULT_TIMEZONE = "Asia/Kolkata";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        String timezone = resolveTimezone(request.timezone());

        if (userRepository.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "Email is already registered");
        }

        User user = new User(email, passwordEncoder.encode(request.password()), timezone);
        try {
            userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException e) {
            // two requests registered the same email at the same moment; the DB unique key won
            throw new ApiException(HttpStatus.CONFLICT, "Email is already registered");
        }
        return UserResponse.from(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(Long userId) {
        return userRepository.findById(userId)
                .map(UserResponse::from)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Session is no longer valid"));
    }

    private String resolveTimezone(String requested) {
        if (requested == null || requested.isBlank()) {
            return DEFAULT_TIMEZONE;
        }
        String tz = requested.trim();
        if (!ZoneId.getAvailableZoneIds().contains(tz)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unknown timezone: " + tz);
        }
        return tz;
    }
}