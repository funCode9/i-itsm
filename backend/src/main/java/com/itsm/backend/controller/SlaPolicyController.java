package com.itsm.backend.controller;

import com.itsm.backend.domain.entity.SlaPolicy;
import com.itsm.backend.service.SlaPolicyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sla-policies")
@RequiredArgsConstructor
public class SlaPolicyController {

    private final SlaPolicyService slaPolicyService;

    @GetMapping
    public ResponseEntity<List<SlaPolicy>> getAll() {
        return ResponseEntity.ok(slaPolicyService.getAllPolicies());
    }

    @PutMapping("/{id}")
    public ResponseEntity<SlaPolicy> update(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        return ResponseEntity.ok(slaPolicyService.updatePolicy(id,
                body.get("responseMinutes"), body.get("resolutionMinutes")));
    }
}
