package com.itsm.backend.controller;

import com.itsm.backend.dto.LoginRequest;
import com.itsm.backend.dto.RegisterRequest;
import com.itsm.backend.domain.entity.User;
import com.itsm.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "i-itsm-backend", "timestamp", System.currentTimeMillis()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        User user = authService.register(req.getUsername(), req.getEmail(), req.getPassword(),
                req.getFullName(), req.getDepartment(), req.getPhone(),
                req.getRole() != null ? req.getRole() : com.itsm.backend.domain.enums.Role.EMPLOYEE);
        return ResponseEntity.ok(Map.of(
                "message", "Registration successful",
                "username", user.getUsername(),
                "role", user.getRole()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        AuthService.LoginResult result = authService.login(req.getUsername(), req.getPassword());
        return ResponseEntity.ok(Map.of(
                "token", result.token(),
                "username", result.username(),
                "role", result.role(),
                "userId", result.userId(),
                "fullName", result.fullName()
        ));
    }
}
