package com.resumeiq.backend.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.resumeiq.backend.model.Job;
import com.resumeiq.backend.model.JobApplication;
import com.resumeiq.backend.repository.JobApplicationRepository;
import com.resumeiq.backend.repository.JobRepository;

@RestController
@CrossOrigin("*")
public class JobApplicationController {

    private final JobApplicationRepository jobApplicationRepository;
    private final JobRepository jobRepository;

    public JobApplicationController(
            JobApplicationRepository jobApplicationRepository,
            JobRepository jobRepository) {

        this.jobApplicationRepository = jobApplicationRepository;
        this.jobRepository = jobRepository;
    }

    // ==========================================
    // 1. Apply for a Job
    // ==========================================
    @PostMapping("/api/jobs/{id}/apply")
    public ResponseEntity<String> applyForJob(
            @PathVariable Long id) {

        // Check whether the job exists
        Job job = jobRepository.findById(id).orElse(null);

        if (job == null) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        JobApplication application = new JobApplication();

        // Temporary user ID
        application.setUserId(1L);

        application.setJobId(job.getId());
        application.setJobTitle(job.getTitle());
        application.setCompany(job.getCompany());
        application.setLocation(job.getLocation());
        application.setAppliedDate(LocalDate.now().toString());
        application.setStatus("Applied");

        jobApplicationRepository.save(application);

        return ResponseEntity.ok(
                "Application submitted successfully!"
        );
    }

    // ==========================================
    // 2. Get All Applications
    // ==========================================
    @GetMapping("/api/applications")
    public ResponseEntity<List<JobApplication>> getApplications() {

        List<JobApplication> applications =
                jobApplicationRepository.findAll();

        return ResponseEntity.ok(applications);
    }

    // ==========================================
    // 3. Get Applications of a User
    // ==========================================
    @GetMapping("/api/applications/user/{userId}")
    public ResponseEntity<List<JobApplication>> getUserApplications(
            @PathVariable Long userId) {

        List<JobApplication> applications =
                jobApplicationRepository.findByUserId(userId);

        return ResponseEntity.ok(applications);
    }

    // ==========================================
    // 4. Delete Application
    // ==========================================
    @DeleteMapping("/api/applications/{id}")
    public ResponseEntity<String> deleteApplication(
            @PathVariable Long id) {

        if (!jobApplicationRepository.existsById(id)) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        jobApplicationRepository.deleteById(id);

        return ResponseEntity.ok(
                "Application deleted successfully!"
        );
    }
}