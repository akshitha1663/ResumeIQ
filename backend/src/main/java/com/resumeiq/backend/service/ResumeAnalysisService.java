package com.resumeiq.backend.service;

import com.resumeiq.backend.model.Resume;
import com.resumeiq.backend.repository.ResumeRepository;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ResumeAnalysisService {

    private final ResumeRepository resumeRepository;

    public ResumeAnalysisService(ResumeRepository resumeRepository) {
        this.resumeRepository = resumeRepository;
    }

    public Map<String, Object> analyzeResume(Long resumeId) {

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Resume not found with ID: " + resumeId));

        Map<String, Object> result = new HashMap<>();

        result.put("id", resume.getId());
        result.put("resumeId", resume.getId());
        result.put("fileName", resume.getFileName());
        result.put("status", "Uploaded successfully");
        result.put("resumeScore", 0);
        result.put("skills", new String[0]);
        result.put("strengths", new String[]{
                "Resume file was uploaded successfully."
        });
        result.put("improvements", new String[]{
                "AI-based resume analysis has not been implemented yet."
        });
        result.put("summary",
                "Resume is saved and ready for analysis.");

        return result;
    }
}