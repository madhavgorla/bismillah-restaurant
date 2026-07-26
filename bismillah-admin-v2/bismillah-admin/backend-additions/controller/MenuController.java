package com.bismillah.controller;

import com.bismillah.model.MenuItem;
import com.bismillah.repository.MenuRepository;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * REPLACE your existing MenuController.java with this file.
 * Adds admin CRUD + availability toggle + categories list.
 */
@RestController
@RequestMapping("/api/menu")
public class MenuController {
    private final MenuRepository repo;
    public MenuController(MenuRepository repo) { this.repo = repo; }

    @GetMapping
    public List<MenuItem> all() { return repo.findAll(); }

    @GetMapping("/categories")
    public List<Map<String,Object>> categories() { return repo.findCategories(); }

    @PostMapping
    public Map<String,Object> create(@RequestBody Map<String,Object> b) {
        MenuItem m = new MenuItem();
        m.categoryId = ((Number) b.get("categoryId")).intValue();
        m.name       = (String) b.get("name");
        m.nameTe     = (String) b.getOrDefault("nameTe", "");
        m.price      = new BigDecimal(b.get("price").toString());
        m.isVeg      = Boolean.TRUE.equals(b.get("isVeg"));
        m.available  = b.get("available") == null ? true : Boolean.TRUE.equals(b.get("available"));
        int id = repo.insert(m);
        return Map.of("ok", true, "id", id);
    }

    @PutMapping("/{id}")
    public Map<String,Object> update(@PathVariable int id, @RequestBody Map<String,Object> b) {
        MenuItem m = new MenuItem();
        m.id         = id;
        m.categoryId = ((Number) b.get("categoryId")).intValue();
        m.name       = (String) b.get("name");
        m.nameTe     = (String) b.getOrDefault("nameTe", "");
        m.price      = new BigDecimal(b.get("price").toString());
        m.isVeg      = Boolean.TRUE.equals(b.get("isVeg"));
        m.available  = Boolean.TRUE.equals(b.get("available"));
        repo.update(m);
        return Map.of("ok", true);
    }

    @PatchMapping("/{id}/available")
    public Map<String,Object> setAvailable(@PathVariable int id, @RequestBody Map<String,Boolean> b) {
        repo.setAvailable(id, Boolean.TRUE.equals(b.get("available")));
        return Map.of("ok", true);
    }

    @DeleteMapping("/{id}")
    public Map<String,Object> delete(@PathVariable int id) {
        repo.delete(id);
        return Map.of("ok", true);
    }
}
