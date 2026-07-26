package com.bismillah.controller;

import com.bismillah.model.Room;
import com.bismillah.repository.RoomRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {
    private final RoomRepository repo;
    public RoomController(RoomRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Room> all() { return repo.findAll(); }

    @PutMapping("/{id}/occupied")
    public Map<String,Object> setOccupied(@PathVariable int id, @RequestBody Map<String,Boolean> body) {
        repo.setOccupied(id, Boolean.TRUE.equals(body.get("occupied")));
        return Map.of("ok", true);
    }
}
