package com.bismillah.repository;

import com.bismillah.model.MenuItem;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * REPLACE your existing MenuRepository.java with this file.
 * Adds insert/update/delete/setAvailable and categories list.
 */
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

    public List<Map<String,Object>> findCategories() {
        return jdbc.queryForList(
            "SELECT id, name, name_te FROM categories ORDER BY sort_order, id");
    }

    public int insert(MenuItem m) {
        jdbc.update(
            "INSERT INTO menu_items (category_id, name, name_te, price, is_veg, available) VALUES (?,?,?,?,?,?)",
            m.categoryId, m.name, m.nameTe, m.price, m.isVeg, m.available);
        Integer id = jdbc.queryForObject("SELECT LAST_INSERT_ID()", Integer.class);
        return id == null ? 0 : id;
    }

    public void update(MenuItem m) {
        jdbc.update(
            "UPDATE menu_items SET category_id=?, name=?, name_te=?, price=?, is_veg=?, available=? WHERE id=?",
            m.categoryId, m.name, m.nameTe, m.price, m.isVeg, m.available, m.id);
    }

    public void setAvailable(int id, boolean available) {
        jdbc.update("UPDATE menu_items SET available=? WHERE id=?", available, id);
    }

    public void delete(int id) {
        jdbc.update("DELETE FROM menu_items WHERE id=?", id);
    }
}
