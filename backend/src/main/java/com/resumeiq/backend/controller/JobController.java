package com.resumeiq.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.resumeiq.backend.model.Job;
import com.resumeiq.backend.repository.JobRepository;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin("*")
public class JobController {

    private final JobRepository jobRepository;

    public JobController(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    // ==========================================
    // 1. Get All Jobs
    // ==========================================
    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs() {

        List<Job> jobs = jobRepository.findAll();

        return ResponseEntity.ok(jobs);
    }

    // ==========================================
    // 2. Get Job By ID
    // ==========================================
    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(
            @PathVariable Long id) {

        return jobRepository.findById(id)
                .map(job -> ResponseEntity.ok(job))
                .orElse(ResponseEntity.notFound().build());
    }

    // ==========================================
    // 3. Create Job
    // ==========================================
    @PostMapping
    public ResponseEntity<Job> createJob(
            @RequestBody Job job) {

        Job savedJob = jobRepository.save(job);

        return ResponseEntity.ok(savedJob);
    }

    // ==========================================
    // 4. Update Job
    // ==========================================
    @PutMapping("/{id}")
    public ResponseEntity<Job> updateJob(
            @PathVariable Long id,
            @RequestBody Job jobDetails) {

        return jobRepository.findById(id)
                .map(job -> {

                    job.setTitle(jobDetails.getTitle());
                    job.setCompany(jobDetails.getCompany());
                    job.setLocation(jobDetails.getLocation());
                    job.setJobType(jobDetails.getJobType());
                    job.setSalary(jobDetails.getSalary());
                    job.setSkills(jobDetails.getSkills());
                    job.setDescription(jobDetails.getDescription());

                    Job updatedJob = jobRepository.save(job);

                    return ResponseEntity.ok(updatedJob);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ==========================================
    // 5. Delete Job
    // ==========================================
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteJob(
            @PathVariable Long id) {

        if (!jobRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        jobRepository.deleteById(id);

        return ResponseEntity.ok("Job deleted successfully");
    }
}