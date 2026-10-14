package com.resumeiq.backend.controller;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.resumeiq.backend.model.Job;
import com.resumeiq.backend.model.JobApplication;
import com.resumeiq.backend.model.Role;
import com.resumeiq.backend.model.User;
import com.resumeiq.backend.repository.JobApplicationRepository;
import com.resumeiq.backend.repository.JobRepository;
import com.resumeiq.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {

    private final JobApplicationRepository jobApplicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public JobApplicationController(
            JobApplicationRepository jobApplicationRepository,
            JobRepository jobRepository,
            UserRepository userRepository) {

        this.jobApplicationRepository = jobApplicationRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(Principal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required.");
        }
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));
    }

    // ─── 1. Get current authenticated user's applications ────────────────────
    @GetMapping("/my")
    public ResponseEntity<List<JobApplication>> getMyApplications(Principal principal) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(jobApplicationRepository.findByUserId(user.getId()));
    }

    // ─── 2. Create or track an application ───────────────────────────────────
    @PostMapping
    public ResponseEntity<JobApplication> createApplication(
            @RequestBody JobApplication application,
            Principal principal) {

        User user = getAuthenticatedUser(principal);
        application.setUserId(user.getId());
        if (application.getAppliedDate() == null || application.getAppliedDate().isBlank()) {
            application.setAppliedDate(LocalDate.now().toString());
        }
        if (application.getStatus() == null || application.getStatus().isBlank()) {
            application.setStatus("Applied");
        }

        return ResponseEntity.ok(jobApplicationRepository.save(application));
    }

    // ─── 3. Quick Apply for a Job ─────────────────────────────────────────────
    @PostMapping("/job/{jobId}/apply")
    public ResponseEntity<Map<String, Object>> applyForJob(
            @PathVariable Long jobId,
            @RequestBody(required = false) Map<String, String> body,
            Principal principal) {

        User user = getAuthenticatedUser(principal);

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found."));

        JobApplication application = new JobApplication();
        application.setUserId(user.getId());
        application.setJobId(job.getId());
        application.setJobTitle(job.getTitle());
        application.setCompany(job.getCompany());
        application.setLocation(job.getLocation());
        application.setAppliedDate(LocalDate.now().toString());
        application.setStatus("Applied");
        if (body != null && body.containsKey("notes")) {
            application.setNotes(body.get("notes"));
        }

        JobApplication saved = jobApplicationRepository.save(application);

        return ResponseEntity.ok(Map.of(
            "message", "Application submitted successfully!",
            "applicationId", saved.getId(),
            "status", saved.getStatus()
        ));
    }

    // ─── 4. Update Application Stage / Notes ──────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<?> updateApplication(
            @PathVariable Long id,
            @RequestBody JobApplication details,
            Principal principal) {

        User user = getAuthenticatedUser(principal);

        return jobApplicationRepository.findById(id).map(app -> {
            // Verify ownership or ADMIN role
            if (!app.getUserId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You cannot edit another user's application."));
            }

            if (details.getStatus() != null && !details.getStatus().isBlank()) {
                app.setStatus(details.getStatus());
            }
            if (details.getNotes() != null) {
                app.setNotes(details.getNotes());
            }
            if (details.getAppliedDate() != null) {
                app.setAppliedDate(details.getAppliedDate());
            }

            return ResponseEntity.ok(jobApplicationRepository.save(app));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ─── 5. Delete Application ────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteApplication(
            @PathVariable Long id,
            Principal principal) {

        User user = getAuthenticatedUser(principal);

        return jobApplicationRepository.findById(id).map(app -> {
            if (!app.getUserId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You cannot delete another user's application."));
            }

            jobApplicationRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Application deleted successfully."));
        }).orElse(ResponseEntity.notFound().build());
    }
}