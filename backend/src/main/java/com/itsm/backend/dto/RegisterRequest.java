package com.itsm.backend.dto;

import com.itsm.backend.domain.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank @Size(min = 3, max = 50)
    private String username;
    @Email @NotBlank
    private String email;
    @NotBlank @Size(min = 6, max = 100)
    private String password;
    @NotBlank
    private String fullName;
    private String department;
    private String phone;
    private Role role = Role.EMPLOYEE;
}
