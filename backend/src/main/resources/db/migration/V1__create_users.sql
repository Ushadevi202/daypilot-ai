CREATE TABLE users (
                       id            BIGINT       NOT NULL AUTO_INCREMENT,
                       email         VARCHAR(255) NOT NULL,
                       password_hash VARCHAR(255) NOT NULL,
                       timezone      VARCHAR(64)  NOT NULL DEFAULT 'Asia/Kolkata',
                       created_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                       PRIMARY KEY (id),
                       CONSTRAINT uq_users_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;