package com.bismillah.controller;

import com.bismillah.model.MenuItem;
import com.bismillah.repository.MenuRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
public class MenuController {
    private final MenuRepository repo;
    public MenuController(MenuRepository repo) { this.repo = repo; }

    @GetMapping
    public List<MenuItem> all() { return repo.findAll(); }
}
