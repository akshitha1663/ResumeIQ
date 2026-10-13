package com.resumeiq.backend.service;


import com.resumeiq.backend.repository.JobRepository;
import com.resumeiq.backend.repository.ResumeRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MatchingService {

    private final ResumeRepository resumeRepository;
    private final JobRepository jobRepository;
    private final ResumeAnalysisService resumeAnalysisService;

    public MatchingService(ResumeRepository resumeRepository,
                           JobRepository jobRepository,
                           ResumeAnalysisService resumeAnalysisService) {
        this.resumeRepository = resumeRepository;
        this.jobRepository = jobRepository;
        this.resumeAnalysisService = resumeAnalysisService;
    }

    /**
     * Calculate match between a resume and a specific job.
     * Returns matchScore (%), matchedSkills, missingSkills.
     */
    public Map<String, Object> calculateMatch(Long resumeId, Long jobId) {
        var resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found: " + resumeId));
        var job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));

        String text = resumeAnalysisService.extractText(resume);
        List<String> resumeSkills = resumeAnalysisService.extractSkills(text);
        List<String> resumeLower = resumeSkills.stream()
                .map(String::toLowerCase).collect(Collectors.toList());

        List<String> jobSkills = parseSkills(job.getSkills());

        List<String> matched = jobSkills.stream()
                .filter(s -> resumeLower.contains(s.toLowerCase()))
                .collect(Collectors.toList());

        List<String> missing = jobSkills.stream()
                .filter(s -> !resumeLower.contains(s.toLowerCase()))
                .collect(Collectors.toList());

        int matchScore = jobSkills.isEmpty() ? 0 :
                (matched.size() * 100) / jobSkills.size();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("resumeId",      resumeId);
        result.put("jobId",         jobId);
        result.put("jobTitle",      job.getTitle());
        result.put("company",       job.getCompany());
        result.put("matchScore",    matchScore);
        result.put("matchedSkills", matched);
        result.put("missingSkills", missing);
        result.put("resumeSkills",  resumeSkills);
        return result;
    }

    public static List<String> parseSkills(String skillsCsv) {
        if (skillsCsv == null || skillsCsv.isBlank()) return List.of();
        return Arrays.stream(skillsCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .collect(Collectors.toList());
    }
}
