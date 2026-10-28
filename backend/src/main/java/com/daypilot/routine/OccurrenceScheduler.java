package com.daypilot.routine;

import java.time.LocalDate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.daypilot.user.User;
import com.daypilot.user.UserRepository;
import com.daypilot.user.UserTime;

@Component
public class OccurrenceScheduler implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(OccurrenceScheduler.class);

    private final UserRepository userRepository;
    private final UserTime userTime;
    private final OccurrenceService occurrenceService;
    private final OccurrenceGenerator generator;

    public OccurrenceScheduler(UserRepository userRepository, UserTime userTime,
                               OccurrenceService occurrenceService, OccurrenceGenerator generator) {
        this.userRepository = userRepository;
        this.userTime = userTime;
        this.occurrenceService = occurrenceService;
        this.generator = generator;
    }

    // Catch-up on every application start, so a restart never leaves gaps.
    @Override
    public void run(ApplicationArguments args) {
        maintain();
    }

    @Scheduled(cron = "0 */30 * * * *")
    public void scheduled() {
        maintain();
    }

    private void maintain() {
        int processed = 0;
        for (User user : userRepository.findAll()) {
            try {
                LocalDate today = userTime.today(user);
                occurrenceService.markMissed(user.getId(), today);
                generator.generateForUser(user.getId(), today, today.plusDays(OccurrenceGenerator.HORIZON_DAYS));
                processed++;
            } catch (Exception e) {
                log.error("Occurrence maintenance failed for user id {}", user.getId(), e);
            }
        }
        log.info("Occurrence maintenance finished for {} user(s)", processed);
    }
}