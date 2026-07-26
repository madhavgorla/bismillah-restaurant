package com.bismillah.repository;

import com.bismillah.model.Room;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class RoomRepository {
    private final JdbcTemplate jdbc;
    public RoomRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    private final RowMapper<Room> mapper = (rs, i) -> {
        Room r = new Room();
        r.id = rs.getInt("id");
        r.name = rs.getString("name");
        r.capacity = rs.getInt("capacity");
        r.occupied = rs.getBoolean("occupied");
        return r;
    };

    public List<Room> findAll() {
        return jdbc.query("SELECT * FROM rooms ORDER BY id", mapper);
    }

    public void setOccupied(int id, boolean occupied) {
        jdbc.update("UPDATE rooms SET occupied=? WHERE id=?", occupied, id);
    }
}
