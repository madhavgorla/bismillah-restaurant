package com.bismillah.controller;

import com.bismillah.repository.AdminRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final AdminRepository repo;
    public AdminController(AdminRepository repo) { this.repo = repo; }

    @PostMapping("/login")
    public Map<String,Object> login(@RequestBody Map<String,String> body) {
        boolean ok = repo.checkPin(body.getOrDefault("pin", ""));
        return Map.of("ok", ok);
    }
}
