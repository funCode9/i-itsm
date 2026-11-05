package com.itsm.backend.service;

import com.itsm.backend.domain.entity.User;
import com.itsm.backend.domain.enums.Role;
import com.itsm.backend.exception.DuplicateResourceException;
import com.itsm.backend.exception.ResourceNotFoundException;
import com.itsm.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Handles user registration, retrieval, and profile management.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User register(String username, String email, String password, String fullName,
                         String department, String phone, Role role) {
        if (userRepository.existsByUsername(username)) {
            throw new DuplicateResourceException("Username already taken: " + username);
        }
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email already registered: " + email);
        }

        User user = User.builder()
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .fullName(fullName)
                .department(department)
                .phone(phone)
                .role(role)
                .enabled(true)
                .build();

        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    @Transactional(readOnly = true)
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

    public User updateUser(Long id, String fullName, String department, String phone, boolean enabled) {
        User user = getUserById(id);
        user.setFullName(fullName);
        user.setDepartment(department);
        user.setPhone(phone);
        user.setEnabled(enabled);
        return userRepository.save(user);
    }

    public void changePassword(Long userId, String newPassword) {
        User user = getUserById(userId);
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public User promoteToAdmin(Long userId) {
        User user = getUserById(userId);
        user.setRole(Role.ADMINISTRATOR);
        return userRepository.save(user);
    }
}
