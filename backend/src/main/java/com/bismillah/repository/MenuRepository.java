package com.bismillah.repository;

import com.bismillah.model.MenuItem;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class MenuRepository {
    private final JdbcTemplate jdbc;
    public MenuRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    private final RowMapper<MenuItem> mapper = (rs, i) -> {
        MenuItem m = new MenuItem();
        m.id = rs.getInt("id");
        m.categoryId = rs.getInt("category_id");
        m.category = rs.getString("category");
        m.name = rs.getString("name");
        m.nameTe = rs.getString("name_te");
        m.price = rs.getBigDecimal("price");
        m.isVeg = rs.getBoolean("is_veg");
        m.available = rs.getBoolean("available");
        return m;
    };

    public List<MenuItem> findAll() {
        return jdbc.query(
            "SELECT m.id, m.category_id, c.name AS category, m.name, m.name_te, " +
            "m.price, m.is_veg, m.available FROM menu_items m " +
            "JOIN categories c ON c.id = m.category_id ORDER BY c.sort_order, m.id",
            mapper);
    }
}
