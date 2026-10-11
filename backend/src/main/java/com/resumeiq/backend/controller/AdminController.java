package com.resumeiq.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.resumeiq.backend.model.Job;
import com.resumeiq.backend.model.JobApplication;
import com.resumeiq.backend.model.User;
import com.resumeiq.backend.repository.JobApplicationRepository;
import com.resumeiq.backend.repository.JobRepository;
import com.resumeiq.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin("*")
public class AdminController {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final JobApplicationRepository jobApplicationRepository;

    public AdminController(
            UserRepository userRepository,
            JobRepository jobRepository,
            JobApplicationRepository jobApplicationRepository) {

        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.jobApplicationRepository = jobApplicationRepository;
    }

    // ==========================================
    // 1. Get All Users
    // ==========================================
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {

        List<User> users = userRepository.findAll();

        return ResponseEntity.ok(users);
    }

    // ==========================================
    // 2. Get All Jobs
    // ==========================================
    @GetMapping("/jobs")
    public ResponseEntity<List<Job>> getAllJobs() {

        List<Job> jobs = jobRepository.findAll();

        return ResponseEntity.ok(jobs);
    }

    // ==========================================
    // 3. Get All Applications
    // ==========================================
    @GetMapping("/applications")
    public ResponseEntity<List<JobApplication>> getAllApplications() {

        List<JobApplication> applications =
                jobApplicationRepository.findAll();

        return ResponseEntity.ok(applications);
    }

    // ==========================================
    // 4. Delete User
    // ==========================================
    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(
            @PathVariable Long id) {

        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        userRepository.deleteById(id);

        return ResponseEntity.ok(
                "User deleted successfully!"
        );
    }

    // ==========================================
    // 5. Delete Job
    // ==========================================
    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<String> deleteJob(
            @PathVariable Long id) {

        if (!jobRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        jobRepository.deleteById(id);

        return ResponseEntity.ok(
                "Job deleted successfully!"
        );
    }
}