package com.resumeiq.backend.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.resumeiq.backend.dto.LoginRequest;
import com.resumeiq.backend.dto.RegisterRequest;
import com.resumeiq.backend.model.Role;
import com.resumeiq.backend.model.User;
import com.resumeiq.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {

        if (request.getName() == null || request.getName().isBlank()
                || request.getEmail() == null
                || request.getEmail().isBlank()
                || request.getPassword() == null
                || request.getPassword().length() < 8) {

            return ResponseEntity.badRequest().body(
                Map.of("message",
                    "Enter your name, email, and a password of at least 8 characters.")
            );
        }

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Email is already registered.")
            );
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Public registration always creates a USER.
        user.setRole(Role.USER);

        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(
            Map.of("message", "Registration successful.")
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        try {
            Authentication authentication =
                authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                        request.getEmail().trim().toLowerCase(),
                        request.getPassword()
                    )
                );

            User user = userRepository.findByEmail(
                    authentication.getName())
                    .orElseThrow();

            return ResponseEntity.ok(Map.of(
                "message", "Login successful.",
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole().name()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("message", "Invalid email or password.")
            );
        }
    }
}