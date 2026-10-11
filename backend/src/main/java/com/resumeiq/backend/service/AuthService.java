package com.resumeiq.backend.service;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.resumeiq.backend.dto.LoginRequest;
import com.resumeiq.backend.dto.RegisterRequest;
import com.resumeiq.backend.model.Role;
import com.resumeiq.backend.model.User;
import com.resumeiq.backend.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    public Map<String, Object> register(RegisterRequest request) {

        if (request.getName() == null ||
                request.getName().isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }

        if (request.getEmail() == null ||
                request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }

        if (request.getPassword() == null ||
                request.getPassword().length() < 8) {
            throw new IllegalArgumentException(
                    "Password must contain at least 8 characters");
        }

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "Email is already registered");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);

        User savedUser = userRepository.save(user);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Registration successful");
        response.put("id", savedUser.getId());
        response.put("name", savedUser.getName());
        response.put("email", savedUser.getEmail());
        response.put("role", savedUser.getRole().name());

        return response;
    }

    public Map<String, Object> login(LoginRequest request) {

        if (request.getEmail() == null ||
                request.getEmail().isBlank() ||
                request.getPassword() == null ||
                request.getPassword().isEmpty()) {
            throw new IllegalArgumentException(
                    "Email and password are required");
        }

        String email = request.getEmail().trim().toLowerCase();

        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                email,
                request.getPassword()
            )
        );

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                    new IllegalArgumentException("User not found"));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Login successful");
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole().name());

        return response;
    }
}