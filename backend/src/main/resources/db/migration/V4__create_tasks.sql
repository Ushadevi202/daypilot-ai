CREATE TABLE tasks (
                       id                BIGINT        NOT NULL AUTO_INCREMENT,
                       user_id           BIGINT        NOT NULL,
                       title             VARCHAR(150)  NOT NULL,
                       description       VARCHAR(1000) NULL,
                       category          VARCHAR(50)   NULL,
                       priority          VARCHAR(10)   NOT NULL DEFAULT 'MEDIUM',
                       status            VARCHAR(16)   NOT NULL DEFAULT 'PENDING',
                       due_date          DATE          NULL,
                       scheduled_time    TIME          NULL,
                       estimated_minutes INT           NULL,
                       notes             VARCHAR(2000) NULL,
                       postponed_count   INT           NOT NULL DEFAULT 0,
                       completed_at      DATETIME(6)   NULL,
                       created_at        DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                       updated_at        DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                       PRIMARY KEY (id),
                       CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                       INDEX idx_tasks_user_status_due (user_id, status, due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE task_history (
                              id         BIGINT       NOT NULL AUTO_INCREMENT,
                              task_id    BIGINT       NOT NULL,
                              user_id    BIGINT       NOT NULL,
                              action     VARCHAR(16)  NOT NULL,
                              details    VARCHAR(500) NULL,
                              created_at DATETIME(6)  NOT NULL,
                              PRIMARY KEY (id),
                              CONSTRAINT fk_history_task FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
                              CONSTRAINT fk_history_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                              INDEX idx_history_task (task_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;