package com.daypilot.common;

import java.time.Instant;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    private final JdbcTemplate jdbc;

    public HealthController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping("/api/health")
    public Map<String, Object> health() {
        String db;
        try {
            jdbc.queryForObject("SELECT 1", Integer.class);
            db = "UP";
        } catch (Exception e) {
            db = "DOWN";
        }
        return Map.of("status", "UP", "database", db, "time", Instant.now().toString());
    }
}