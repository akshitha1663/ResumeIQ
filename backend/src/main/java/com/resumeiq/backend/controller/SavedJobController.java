package com.resumeiq.backend.controller;

import com.resumeiq.backend.model.Job;
import com.resumeiq.backend.model.SavedJob;
import com.resumeiq.backend.model.User;
import com.resumeiq.backend.repository.JobRepository;
import com.resumeiq.backend.repository.SavedJobRepository;
import com.resumeiq.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/saved-jobs")
public class SavedJobController {

    private final SavedJobRepository savedJobRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public SavedJobController(SavedJobRepository savedJobRepository,
                              JobRepository jobRepository,
                              UserRepository userRepository) {
        this.savedJobRepository = savedJobRepository;
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

    @GetMapping
    public ResponseEntity<List<Job>> getSavedJobs(Principal principal) {
        User user = getAuthenticatedUser(principal);
        List<SavedJob> saved = savedJobRepository.findByUserIdOrderBySavedAtDesc(user.getId());
        List<Long> jobIds = saved.stream().map(SavedJob::getJobId).collect(Collectors.toList());
        List<Job> jobs = jobRepository.findAllById(jobIds);
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/ids")
    public ResponseEntity<List<Long>> getSavedJobIds(Principal principal) {
        if (principal == null) return ResponseEntity.ok(List.of());
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null) return ResponseEntity.ok(List.of());
        List<SavedJob> saved = savedJobRepository.findByUserIdOrderBySavedAtDesc(user.getId());
        return ResponseEntity.ok(saved.stream().map(SavedJob::getJobId).collect(Collectors.toList()));
    }

    @PostMapping("/{jobId}")
    public ResponseEntity<?> saveJob(@PathVariable Long jobId, Principal principal) {
        User user = getAuthenticatedUser(principal);
        if (!jobRepository.existsById(jobId)) {
            return ResponseEntity.notFound().build();
        }
        if (savedJobRepository.existsByUserIdAndJobId(user.getId(), jobId)) {
            return ResponseEntity.ok(Map.of("message", "Job already saved."));
        }
        SavedJob savedJob = new SavedJob(user.getId(), jobId);
        savedJobRepository.save(savedJob);
        return ResponseEntity.ok(Map.of("message", "Job saved successfully.", "jobId", jobId));
    }

    @DeleteMapping("/{jobId}")
    @Transactional
    public ResponseEntity<?> removeSavedJob(@PathVariable Long jobId, Principal principal) {
        User user = getAuthenticatedUser(principal);
        savedJobRepository.deleteByUserIdAndJobId(user.getId(), jobId);
        return ResponseEntity.ok(Map.of("message", "Job removed from saved list.", "jobId", jobId));
    }
}
