package com.daypilot.jobs;

public enum JobEventType {
    SUBMITTED,
    ACKNOWLEDGED,
    ASSESSMENT_INVITATION,
    ASSESSMENT_DEADLINE,
    INTERVIEW_ROUND_1,
    INTERVIEW_ROUND_2,
    INTERVIEW_FURTHER,
    OFFER,
    REJECTION,
    FOLLOW_UP_SENT,
    FOLLOW_UP_REMINDER,
    STATUS_CHANGE,
    OTHER;

    /** Events that happen on a future date, so they must have a date and appear in "upcoming". */
    public boolean isScheduled() {
        return this == ASSESSMENT_DEADLINE || this == INTERVIEW_ROUND_1 || this == INTERVIEW_ROUND_2
                || this == INTERVIEW_FURTHER || this == FOLLOW_UP_REMINDER;
    }
}