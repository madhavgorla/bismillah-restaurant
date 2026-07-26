package com.bismillah.controller;

import com.bismillah.model.Booking;
import com.bismillah.repository.BookingRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    private final BookingRepository repo;
    public BookingController(BookingRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Booking> all() { return repo.findAll(); }

    @PostMapping
    public Map<String,Object> create(@RequestBody Map<String,Object> body) {
        Booking b = new Booking();
        b.name = (String) body.get("name");
        b.phone = (String) body.get("phone");
        b.guests = ((Number) body.get("guests")).intValue();
        b.bookingTime = LocalDateTime.parse((String) body.get("bookingTime"));
        b.notes = (String) body.getOrDefault("notes", "");
        repo.insert(b);
        return Map.of("ok", true);
    }
}
