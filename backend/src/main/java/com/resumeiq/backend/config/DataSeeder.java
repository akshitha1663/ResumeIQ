package com.resumeiq.backend.config;

import com.resumeiq.backend.model.Role;
import com.resumeiq.backend.model.User;
import com.resumeiq.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * DataSeeder – creates the first ADMIN user on startup when the ADMIN_SEED_EMAIL
 * and ADMIN_SEED_PASSWORD environment variables are both set and no ADMIN account
 * exists yet in the database. Safe to run on every startup.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    @Value("${admin.seed.email:}")
    private String seedEmail;

    @Value("${admin.seed.password:}")
    private String seedPassword;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Only seed when both env vars are explicitly provided
        if (seedEmail == null || seedEmail.isBlank()
                || seedPassword == null || seedPassword.isBlank()) {
            return;
        }

        String email = seedEmail.trim().toLowerCase();

        // Do not create a duplicate
        if (userRepository.existsByEmail(email)) {
            return;
        }

        User admin = new User();
        admin.setName("Admin");
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(seedPassword));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);

        System.out.println("[ResumeIQ] Admin account seeded for: " + email);
    }
}
