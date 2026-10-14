package com.resumeiq.backend.controller;

import com.resumeiq.backend.model.Job;
import com.resumeiq.backend.model.JobAlert;
import com.resumeiq.backend.model.User;
import com.resumeiq.backend.repository.JobAlertRepository;
import com.resumeiq.backend.repository.JobRepository;
import com.resumeiq.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/alerts")
public class JobAlertController {

    private final JobAlertRepository alertRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public JobAlertController(JobAlertRepository alertRepository,
                              JobRepository jobRepository,
                              UserRepository userRepository) {
        this.alertRepository = alertRepository;
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
    public ResponseEntity<List<JobAlert>> getMyAlerts(Principal principal) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(alertRepository.findByUserIdOrderByCreatedAtDesc(user.getId()));
    }

    @PostMapping
    public ResponseEntity<JobAlert> createAlert(@RequestBody JobAlert alert, Principal principal) {
        User user = getAuthenticatedUser(principal);
        alert.setUserId(user.getId());
        alert.setActive(true);
        return ResponseEntity.ok(alertRepository.save(alert));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAlert(@PathVariable Long id, Principal principal) {
        User user = getAuthenticatedUser(principal);
        return alertRepository.findById(id).map(a -> {
            if (!a.getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access denied."));
            }
            alertRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Alert removed successfully."));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/matches")
    public ResponseEntity<List<Map<String, Object>>> getMatchingJobs(Principal principal) {
        User user = getAuthenticatedUser(principal);
        List<JobAlert> alerts = alertRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        List<Job> allJobs = jobRepository.findByActiveTrueOrderByIdDesc();

        List<Map<String, Object>> matches = new ArrayList<>();
        for (JobAlert alert : alerts) {
            for (Job job : allJobs) {
                boolean matchTitle = alert.getRoleTitle() == null || alert.getRoleTitle().isBlank()
                        || job.getTitle().toLowerCase().contains(alert.getRoleTitle().toLowerCase());
                boolean matchLocation = alert.getLocation() == null || alert.getLocation().isBlank()
                        || job.getLocation().toLowerCase().contains(alert.getLocation().toLowerCase());
                boolean matchWorkMode = alert.getWorkMode() == null || alert.getWorkMode().isBlank()
                        || job.getWorkMode().equalsIgnoreCase(alert.getWorkMode());

                if (matchTitle && matchLocation && matchWorkMode) {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("alertId", alert.getId());
                    item.put("alertRole", alert.getRoleTitle());
                    item.put("job", job);
                    matches.add(item);
                }
            }
        }

        return ResponseEntity.ok(matches);
    }

    @GetMapping("/{id}/matches")
    public ResponseEntity<List<Job>> getAlertMatchesById(@PathVariable Long id, Principal principal) {
        User user = getAuthenticatedUser(principal);
        return alertRepository.findById(id).map(alert -> {
            if (!alert.getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).<List<Job>>build();
            }
            List<Job> allJobs = jobRepository.findByActiveTrueOrderByIdDesc();
            List<Job> matched = allJobs.stream().filter(job -> {
                boolean matchTitle = alert.getRoleTitle() == null || alert.getRoleTitle().isBlank()
                        || job.getTitle().toLowerCase().contains(alert.getRoleTitle().toLowerCase());
                boolean matchLocation = alert.getLocation() == null || alert.getLocation().isBlank()
                        || job.getLocation().toLowerCase().contains(alert.getLocation().toLowerCase());
                boolean matchWorkMode = alert.getWorkMode() == null || alert.getWorkMode().isBlank()
                        || job.getWorkMode().equalsIgnoreCase(alert.getWorkMode());
                return matchTitle && matchLocation && matchWorkMode;
            }).toList();
            return ResponseEntity.ok(matched);
        }).orElse(ResponseEntity.notFound().build());
    }
}
