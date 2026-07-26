package com.bismillah.controller;

import com.bismillah.model.Order;
import com.bismillah.repository.OrderRepository;
import com.bismillah.repository.RoomRepository;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderRepository repo;
    private final RoomRepository rooms;

    public OrderController(OrderRepository repo, RoomRepository rooms) {
        this.repo = repo; this.rooms = rooms;
    }

    @GetMapping
    public List<Order> all() { return repo.findAll(); }

    @GetMapping("/{id}")
    public Order one(@PathVariable int id) { return repo.findById(id); }

    @GetMapping("/number/{number}")
    public Order byNumber(@PathVariable String number) { return repo.findByNumber(number); }

    @PostMapping
    public Map<String,Object> place(@RequestBody Map<String,Object> body) {
        Order o = new Order();
        o.type = (String) body.getOrDefault("type", "DELIVERY");
        Object rid = body.get("roomId");
        o.roomId = rid == null ? null : ((Number) rid).intValue();
        o.customerName = (String) body.get("customerName");
        o.customerPhone = (String) body.get("customerPhone");
        o.address = (String) body.get("address");
        o.paymentMethod = (String) body.get("paymentMethod");
        o.total = new BigDecimal(body.get("total").toString());
        o.itemsJson = body.get("items").toString(); // frontend sends JSON string
        o.status = "NEW";
        o.orderNumber = "#" + (100 + (int)(Math.random() * 900)) + "-" + System.currentTimeMillis() % 1000;

        int id = repo.insert(o);
        if ("DINE_IN".equals(o.type) && o.roomId != null) {
            rooms.setOccupied(o.roomId, true);
        }
        Order saved = repo.findById(id);
        return Map.of("id", id, "orderNumber", saved.orderNumber, "order", saved);
    }

    @PutMapping("/{id}/status")
    public Map<String,Object> updateStatus(@PathVariable int id, @RequestBody Map<String,String> body) {
        String status = body.get("status");
        repo.updateStatus(id, status);
        Order o = repo.findById(id);
        if (o != null && "DINE_IN".equals(o.type) && o.roomId != null
                && ("DELIVERED".equals(status) || "CANCELLED".equals(status))) {
            rooms.setOccupied(o.roomId, false);
        }
        return Map.of("ok", true);
    }
}
