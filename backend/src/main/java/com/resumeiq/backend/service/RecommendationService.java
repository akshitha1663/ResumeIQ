package com.resumeiq.backend.service;

import com.resumeiq.backend.model.Job;
import com.resumeiq.backend.repository.JobRepository;
import com.resumeiq.backend.repository.ResumeRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final ResumeRepository resumeRepository;
    private final JobRepository jobRepository;
    private final ResumeAnalysisService resumeAnalysisService;

    public RecommendationService(ResumeRepository resumeRepository,
                                 JobRepository jobRepository,
                                 ResumeAnalysisService resumeAnalysisService) {
        this.resumeRepository = resumeRepository;
        this.jobRepository = jobRepository;
        this.resumeAnalysisService = resumeAnalysisService;
    }

    /**
     * Rank all available jobs by how well they match this resume.
     * Returns top results sorted by match score descending.
     */
    public List<Map<String, Object>> recommend(Long resumeId, int topN) {
        var resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found: " + resumeId));

        String text = resumeAnalysisService.extractText(resume);
        List<String> resumeSkillsLower = resumeAnalysisService.extractSkills(text)
                .stream().map(String::toLowerCase).collect(Collectors.toList());

        List<Job> allJobs = jobRepository.findAll();

        return allJobs.stream().map(job -> {
            List<String> jobSkills = MatchingService.parseSkills(job.getSkills());

            List<String> matched = jobSkills.stream()
                    .filter(s -> resumeSkillsLower.contains(s.toLowerCase()))
                    .collect(Collectors.toList());

            int score = jobSkills.isEmpty() ? 0 :
                    (matched.size() * 100) / jobSkills.size();

            String reason = matched.isEmpty()
                    ? "Explore this role to expand your skill set."
                    : "Matches your skills: " + String.join(", ", matched.subList(0, Math.min(3, matched.size())));

            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("jobId",         job.getId());
            entry.put("title",         job.getTitle());
            entry.put("company",       job.getCompany());
            entry.put("location",      job.getLocation());
            entry.put("jobType",       job.getJobType());
            entry.put("salary",        job.getSalary());
            entry.put("matchScore",    score);
            entry.put("matchedSkills", matched);
            entry.put("reason",        reason);
            return entry;
        })
        .sorted((a, b) -> Integer.compare((int) b.get("matchScore"), (int) a.get("matchScore")))
        .limit(topN)
        .collect(Collectors.toList());
    }
}
