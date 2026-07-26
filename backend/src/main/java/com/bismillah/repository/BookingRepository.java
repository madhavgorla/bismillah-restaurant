package com.bismillah.repository;

import com.bismillah.model.Booking;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;

@Repository
public class BookingRepository {
    private final JdbcTemplate jdbc;
    public BookingRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    private final RowMapper<Booking> mapper = (rs, i) -> {
        Booking b = new Booking();
        b.id = rs.getInt("id");
        b.name = rs.getString("name");
        b.phone = rs.getString("phone");
        b.guests = rs.getInt("guests");
        b.bookingTime = rs.getTimestamp("booking_time").toLocalDateTime();
        b.notes = rs.getString("notes");
        b.createdAt = rs.getTimestamp("created_at").toLocalDateTime();
        return b;
    };

    public int insert(Booking b) {
        return jdbc.update(
            "INSERT INTO bookings (name,phone,guests,booking_time,notes) VALUES (?,?,?,?,?)",
            b.name, b.phone, b.guests, Timestamp.valueOf(b.bookingTime), b.notes);
    }

    public List<Booking> findAll() {
        return jdbc.query("SELECT * FROM bookings ORDER BY booking_time DESC", mapper);
    }
}
