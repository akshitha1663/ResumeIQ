package com.resumeiq.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.resumeiq.backend.model.Job;
import com.resumeiq.backend.repository.JobRepository;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobRepository jobRepository;

    public JobController(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    @GetMapping
    public ResponseEntity<List<Job>> getJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String jobType,
            @RequestParam(required = false) String workMode,
            @RequestParam(required = false) String location) {

        if ((keyword != null && !keyword.isBlank())
                || (jobType != null && !jobType.isBlank())
                || (workMode != null && !workMode.isBlank())
                || (location != null && !location.isBlank())) {
            return ResponseEntity.ok(jobRepository.searchJobs(
                    keyword != null && !keyword.isBlank() ? keyword.trim() : null,
                    jobType != null && !jobType.isBlank() ? jobType.trim() : null,
                    workMode != null && !workMode.isBlank() ? workMode.trim() : null,
                    location != null && !location.isBlank() ? location.trim() : null
            ));
        }

        return ResponseEntity.ok(jobRepository.findByActiveTrueOrderByIdDesc());
    }

    @GetMapping("/metadata")
    public ResponseEntity<Map<String, Object>> getJobMetadata() {
        return ResponseEntity.ok(Map.of(
            "jobTypes", List.of("Full-time", "Part-time", "Internship", "Contract", "Freelance", "Temporary"),
            "workModes", List.of("Remote", "Hybrid", "On-site"),
            "experienceLevels", List.of("Entry Level", "Mid Level", "Senior", "Lead")
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable Long id) {
        return jobRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Job> createJob(@RequestBody Job job) {
        return ResponseEntity.ok(jobRepository.save(job));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Job> updateJob(@PathVariable Long id, @RequestBody Job jobDetails) {
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

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteJob(@PathVariable Long id) {
        if (!jobRepository.existsById(id)) return ResponseEntity.notFound().build();
        jobRepository.deleteById(id);
        return ResponseEntity.ok("Job deleted successfully");
    }
}