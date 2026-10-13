package com.resumeiq.backend.service;

import com.resumeiq.backend.repository.JobRepository;
import com.resumeiq.backend.repository.ResumeRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SkillGapService {

    private final ResumeRepository resumeRepository;
    private final JobRepository jobRepository;
    private final ResumeAnalysisService resumeAnalysisService;

    public SkillGapService(ResumeRepository resumeRepository,
                           JobRepository jobRepository,
                           ResumeAnalysisService resumeAnalysisService) {
        this.resumeRepository = resumeRepository;
        this.jobRepository = jobRepository;
        this.resumeAnalysisService = resumeAnalysisService;
    }

    public Map<String, Object> analyzeGap(Long resumeId, Long jobId) {
        var resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found: " + resumeId));
        var job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));

        String text = resumeAnalysisService.extractText(resume);
        List<String> resumeSkills = resumeAnalysisService.extractSkills(text);
        List<String> resumeLower  = resumeSkills.stream()
                .map(String::toLowerCase).collect(Collectors.toList());
        List<String> jobSkills    = MatchingService.parseSkills(job.getSkills());

        List<String> matched = jobSkills.stream()
                .filter(s -> resumeLower.contains(s.toLowerCase()))
                .collect(Collectors.toList());

        List<String> missing = jobSkills.stream()
                .filter(s -> !resumeLower.contains(s.toLowerCase()))
                .collect(Collectors.toList());

        int matchPercent = jobSkills.isEmpty() ? 0 :
                (matched.size() * 100) / jobSkills.size();

        // Generate learning suggestions for each missing skill
        List<Map<String, String>> suggestions = missing.stream().map(skill -> {
            Map<String, String> s = new LinkedHashMap<>();
            s.put("skill", skill);
            s.put("suggestion", "Practice " + skill + " through online courses, "
                    + "personal projects, or open-source contributions.");
            return s;
        }).collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("resumeId",      resumeId);
        result.put("jobId",         jobId);
        result.put("jobTitle",      job.getTitle());
        result.put("company",       job.getCompany());
        result.put("matchPercent",  matchPercent);
        result.put("matchedSkills", matched);
        result.put("missingSkills", missing);
        result.put("suggestions",   suggestions);
        return result;
    }
}
