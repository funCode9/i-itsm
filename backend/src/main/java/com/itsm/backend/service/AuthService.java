package com.itsm.backend.service;

import com.itsm.backend.domain.entity.User;
import com.itsm.backend.domain.enums.Role;
import com.itsm.backend.repository.UserRepository;
import com.itsm.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

/**
 * Authentication service: login and token generation.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final UserRepository userRepository;

    public record LoginResult(String token, String username, String role, Long userId, String fullName) {}

    public LoginResult login(String username, String password) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password));

        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        User user = userRepository.findByUsername(username).orElseThrow();
        String role = user.getRole().name();
        String token = jwtUtil.generateToken(userDetails, role);

        return new LoginResult(token, username, role, user.getId(), user.getFullName());
    }

    public User register(String username, String email, String password, String fullName,
                          String department, String phone, Role role) {
        return userService.register(username, email, password, fullName, department, phone, role);
    }
}
