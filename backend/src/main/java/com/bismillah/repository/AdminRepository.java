package com.bismillah.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class AdminRepository {
    private final JdbcTemplate jdbc;
    public AdminRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public boolean checkPin(String pin) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM admin_settings WHERE id=1 AND pin=?",
            Integer.class, pin);
        return count != null && count > 0;
    }
}
