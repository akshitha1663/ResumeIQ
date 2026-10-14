package com.resumeiq.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.resumeiq.backend.dto.AdminUserDTO;
import com.resumeiq.backend.model.Job;
import com.resumeiq.backend.model.JobApplication;
import com.resumeiq.backend.model.TargetRole;
import com.resumeiq.backend.repository.JobApplicationRepository;
import com.resumeiq.backend.repository.JobRepository;
import com.resumeiq.backend.repository.ResumeRepository;
import com.resumeiq.backend.repository.TargetRoleRepository;
import com.resumeiq.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final ResumeRepository resumeRepository;
    private final TargetRoleRepository targetRoleRepository;

    public AdminController(
            UserRepository userRepository,
            JobRepository jobRepository,
            JobApplicationRepository jobApplicationRepository,
            ResumeRepository resumeRepository,
            TargetRoleRepository targetRoleRepository) {

        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.resumeRepository = resumeRepository;
        this.targetRoleRepository = targetRoleRepository;
    }

    // ─── Stats ────────────────────────────────────────────────────────────────
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        long users       = userRepository.count();
        long resumes     = resumeRepository.count();
        long jobs        = jobRepository.count();
        long targetRoles = targetRoleRepository.count();
        return ResponseEntity.ok(Map.of(
            "users",       users,
            "resumes",     resumes,
            "jobs",        jobs,
            "targetRoles", targetRoles
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

    // ─── Target Roles Management ──────────────────────────────────────────────
    @GetMapping("/target-roles")
    public ResponseEntity<List<TargetRole>> getAllTargetRoles() {
        return ResponseEntity.ok(targetRoleRepository.findAll());
    }

    @PostMapping("/target-roles")
    public ResponseEntity<?> createTargetRole(@RequestBody TargetRole role) {
        if (role.getTitle() == null || role.getTitle().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Role title is required."));
        }
        if (role.getRequiredSkills() == null || role.getRequiredSkills().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Required skills are required."));
        }
        return ResponseEntity.ok(targetRoleRepository.save(role));
    }

    @PutMapping("/target-roles/{id}")
    public ResponseEntity<?> updateTargetRole(@PathVariable Long id, @RequestBody TargetRole roleDetails) {
        return targetRoleRepository.findById(id).map(role -> {
            role.setTitle(roleDetails.getTitle());
            role.setCategory(roleDetails.getCategory());
            role.setDescription(roleDetails.getDescription());
            role.setRequiredSkills(roleDetails.getRequiredSkills());
            role.setOptionalSkills(roleDetails.getOptionalSkills());
            role.setExperienceLevel(roleDetails.getExperienceLevel());
            role.setActive(roleDetails.isActive());
            return ResponseEntity.ok(targetRoleRepository.save(role));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/target-roles/{id}")
    public ResponseEntity<Map<String, String>> deleteTargetRole(@PathVariable Long id) {
        return targetRoleRepository.findById(id).map(role -> {
            // soft-delete / deactivate
            role.setActive(false);
            targetRoleRepository.save(role);
            return ResponseEntity.ok(Map.of("message", "Target role deactivated successfully."));
        }).orElse(ResponseEntity.notFound().build());
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
        if (job.getCompany() == null || job.getCompany().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Company name is required."));
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
            job.setWorkMode(jobDetails.getWorkMode());
            job.setExperienceLevel(jobDetails.getExperienceLevel());
            job.setSalary(jobDetails.getSalary());
            job.setSkills(jobDetails.getSkills());
            job.setDescription(jobDetails.getDescription());
            job.setApplyLink(jobDetails.getApplyLink());
            job.setActive(jobDetails.isActive());
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