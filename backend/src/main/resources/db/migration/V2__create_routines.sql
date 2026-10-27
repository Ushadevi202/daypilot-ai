CREATE TABLE routines (
                          id                BIGINT        NOT NULL AUTO_INCREMENT,
                          user_id           BIGINT        NOT NULL,
                          title             VARCHAR(150)  NOT NULL,
                          description       VARCHAR(1000) NULL,
                          start_time        TIME          NOT NULL,
                          end_time          TIME          NOT NULL,
                          estimated_minutes INT           NOT NULL,
                          recurrence_type   VARCHAR(16)   NOT NULL,
                          days_of_week      VARCHAR(64)   NULL,
                          start_date        DATE          NOT NULL,
                          end_date          DATE          NULL,
                          active            BOOLEAN       NOT NULL DEFAULT TRUE,
                          created_at        DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                          updated_at        DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                          PRIMARY KEY (id),
                          CONSTRAINT fk_routines_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                          INDEX idx_routines_user_active (user_id, active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;