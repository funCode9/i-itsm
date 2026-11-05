package com.itsm.backend.controller;

import com.itsm.backend.domain.entity.User;
import com.itsm.backend.repository.UserRepository;
import com.itsm.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<User> getMe(Authentication auth) {
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        return ResponseEntity.ok(user);
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateMe(@RequestBody Map<String, String> body, Authentication auth) {
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        return ResponseEntity.ok(userService.updateUser(user.getId(),
                body.getOrDefault("fullName", user.getFullName()),
                body.getOrDefault("department", user.getDepartment()),
                body.getOrDefault("phone", user.getPhone()),
                true));
    }
}
