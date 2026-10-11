package com.resumeiq.backend.controller;

import java.util.Arrays;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/matching")
@CrossOrigin("*")
public class MatchingController {

    // ==========================================
    // AI Job Matching
    // ==========================================
    @GetMapping("/{jobId}")
    public ResponseEntity<MatchingResponse> calculateJobMatch(
            @PathVariable Long jobId) {

        // Sample resume skills
        List<String> resumeSkills = Arrays.asList(
                "Java",
                "React",
                "Spring Boot",
                "MySQL"
        );

        // Sample job required skills
        List<String> requiredSkills = Arrays.asList(
                "Java",
                "Spring Boot",
                "MySQL",
                "React"
        );

        // Calculate matched and missing skills
        List<String> matchedSkills = resumeSkills.stream()
                .filter(requiredSkills::contains)
                .toList();

        List<String> missingSkills = requiredSkills.stream()
                .filter(skill -> !resumeSkills.contains(skill))
                .toList();

        int matchScore = 0;

        if (!requiredSkills.isEmpty()) {
            matchScore =
                    (matchedSkills.size() * 100)
                    / requiredSkills.size();
        }

        MatchingResponse response = new MatchingResponse();

        response.setJobId(jobId);
        response.setJobTitle("Java Developer");
        response.setMatchScore(matchScore);
        response.setMatchedSkills(matchedSkills);
        response.setMissingSkills(missingSkills);

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // Response Class
    // ==========================================
    public static class MatchingResponse {

        private Long jobId;
        private String jobTitle;
        private int matchScore;
        private List<String> matchedSkills;
        private List<String> missingSkills;

        public Long getJobId() {
            return jobId;
        }

        public void setJobId(Long jobId) {
            this.jobId = jobId;
        }

        public String getJobTitle() {
            return jobTitle;
        }

        public void setJobTitle(String jobTitle) {
            this.jobTitle = jobTitle;
        }

        public int getMatchScore() {
            return matchScore;
        }

        public void setMatchScore(int matchScore) {
            this.matchScore = matchScore;
        }

        public List<String> getMatchedSkills() {
            return matchedSkills;
        }

        public void setMatchedSkills(List<String> matchedSkills) {
            this.matchedSkills = matchedSkills;
        }

        public List<String> getMissingSkills() {
            return missingSkills;
        }

        public void setMissingSkills(List<String> missingSkills) {
            this.missingSkills = missingSkills;
        }
    }
}