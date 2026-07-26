package com.bismillah.repository;

import com.bismillah.model.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;

@Repository
public class OrderRepository {
    private final JdbcTemplate jdbc;
    public OrderRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    private final RowMapper<Order> mapper = (rs, i) -> {
        Order o = new Order();
        o.id = rs.getInt("id");
        o.orderNumber = rs.getString("order_number");
        o.type = rs.getString("type");
        int r = rs.getInt("room_id"); o.roomId = rs.wasNull() ? null : r;
        o.customerName = rs.getString("customer_name");
        o.customerPhone = rs.getString("customer_phone");
        o.address = rs.getString("address");
        o.paymentMethod = rs.getString("payment_method");
        o.total = rs.getBigDecimal("total");
        o.status = rs.getString("status");
        o.itemsJson = rs.getString("items_json");
        o.createdAt = rs.getTimestamp("created_at").toLocalDateTime();
        return o;
    };

    public int insert(Order o) {
        KeyHolder kh = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(
              "INSERT INTO orders (order_number,type,room_id,customer_name,customer_phone,address,payment_method,total,status,items_json) " +
              "VALUES (?,?,?,?,?,?,?,?,?,?)", Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, o.orderNumber);
            ps.setString(2, o.type);
            if (o.roomId == null) ps.setNull(3, java.sql.Types.INTEGER); else ps.setInt(3, o.roomId);
            ps.setString(4, o.customerName);
            ps.setString(5, o.customerPhone);
            ps.setString(6, o.address);
            ps.setString(7, o.paymentMethod);
            ps.setBigDecimal(8, o.total);
            ps.setString(9, o.status == null ? "NEW" : o.status);
            ps.setString(10, o.itemsJson);
            return ps;
        }, kh);
        return kh.getKey().intValue();
    }

    public List<Order> findAll() {
        return jdbc.query("SELECT * FROM orders ORDER BY id DESC", mapper);
    }

    public Order findById(int id) {
        List<Order> l = jdbc.query("SELECT * FROM orders WHERE id=?", mapper, id);
        return l.isEmpty() ? null : l.get(0);
    }

    public Order findByNumber(String number) {
        List<Order> l = jdbc.query("SELECT * FROM orders WHERE order_number=?", mapper, number);
        return l.isEmpty() ? null : l.get(0);
    }

    public void updateStatus(int id, String status) {
        jdbc.update("UPDATE orders SET status=? WHERE id=?", status, id);
    }
}
