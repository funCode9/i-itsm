package com.itsm.backend.controller;

import com.itsm.backend.domain.entity.ItService;
import com.itsm.backend.service.ItServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ItServiceService serviceService;

    @GetMapping
    public ResponseEntity<List<ItService>> getAll() {
        return ResponseEntity.ok(serviceService.getActiveServices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItService> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(serviceService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ItService> create(@RequestBody Map<String, Object> body) {
        Long catId = body.get("categoryId") != null ? Long.valueOf(body.get("categoryId").toString()) : null;
        return ResponseEntity.ok(serviceService.createService(
                (String) body.get("name"), (String) body.get("description"), catId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItService> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Long catId = body.get("categoryId") != null ? Long.valueOf(body.get("categoryId").toString()) : null;
        return ResponseEntity.ok(serviceService.update(id,
                (String) body.get("name"), (String) body.get("description"),
                catId, Boolean.TRUE.equals(body.getOrDefault("active", true))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        serviceService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Service deleted"));
    }
}
