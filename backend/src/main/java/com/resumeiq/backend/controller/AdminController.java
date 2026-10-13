package com.resumeiq.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.resumeiq.backend.dto.AdminUserDTO;
import com.resumeiq.backend.model.Job;
import com.resumeiq.backend.model.JobApplication;
import com.resumeiq.backend.repository.JobApplicationRepository;
import com.resumeiq.backend.repository.JobRepository;
import com.resumeiq.backend.repository.ResumeRepository;
import com.resumeiq.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final ResumeRepository resumeRepository;

    public AdminController(
            UserRepository userRepository,
            JobRepository jobRepository,
            JobApplicationRepository jobApplicationRepository,
            ResumeRepository resumeRepository) {

        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.resumeRepository = resumeRepository;
    }

    // ─── Stats ────────────────────────────────────────────────────────────────
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        long users   = userRepository.count();
        long resumes = resumeRepository.count();
        long jobs    = jobRepository.count();
        return ResponseEntity.ok(Map.of(
            "users",   users,
            "resumes", resumes,
            "jobs",    jobs
        ));
    }

    // ─── Users (safe DTO – no passwords) ─────────────────────────────────────
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDTO>> getAllUsers() {
        List<AdminUserDTO> dtos = userRepository.findAll().stream()
            .map(u -> new AdminUserDTO(u.getId(), u.getName(), u.getEmail(), u.getRole().name()))
            .toList();
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully."));
    }

    // ─── Jobs ─────────────────────────────────────────────────────────────────
    @GetMapping("/jobs")
    public ResponseEntity<List<Job>> getAllJobs() {
        return ResponseEntity.ok(jobRepository.findAll());
    }

    @PostMapping("/jobs")
    public ResponseEntity<?> createJob(@RequestBody Job job) {
        if (job.getTitle() == null || job.getTitle().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Job title is required."));
        }
        return ResponseEntity.ok(jobRepository.save(job));
    }

    @PutMapping("/jobs/{id}")
    public ResponseEntity<?> updateJob(@PathVariable Long id, @RequestBody Job jobDetails) {
        return jobRepository.findById(id).map(job -> {
            job.setTitle(jobDetails.getTitle());
            job.setCompany(jobDetails.getCompany());
            job.setLocation(jobDetails.getLocation());
            job.setJobType(jobDetails.getJobType());
            job.setSalary(jobDetails.getSalary());
            job.setSkills(jobDetails.getSkills());
            job.setDescription(jobDetails.getDescription());
            return ResponseEntity.ok(jobRepository.save(job));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<Map<String, String>> deleteJob(@PathVariable Long id) {
        if (!jobRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        jobRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Job deleted successfully."));
    }

    // ─── Applications ─────────────────────────────────────────────────────────
    @GetMapping("/applications")
    public ResponseEntity<List<JobApplication>> getAllApplications() {
        return ResponseEntity.ok(jobApplicationRepository.findAll());
    }
}