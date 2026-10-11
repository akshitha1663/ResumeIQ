package com.resumeiq.backend.controller;

import java.util.Arrays;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/skill-gap")
@CrossOrigin("*")
public class SkillGapController {

    // ==========================================
    // Skill Gap Analysis
    // ==========================================
    @GetMapping("/{jobId}")
    public ResponseEntity<SkillGapResponse> analyzeSkillGap(
            @PathVariable Long jobId) {

        // Skills available in the user's resume
        List<String> currentSkills = Arrays.asList(
                "Java",
                "React",
                "MySQL"
        );

        // Skills required for the selected job
        List<String> requiredSkills = Arrays.asList(
                "Java",
                "React",
                "Spring Boot",
                "MySQL",
                "Docker"
        );

        // Find missing skills
        List<String> missingSkills = requiredSkills.stream()
                .filter(skill -> !currentSkills.contains(skill))
                .toList();

        SkillGapResponse response = new SkillGapResponse();

        response.setJobId(jobId);
        response.setJobTitle("Java Developer");
        response.setCurrentSkills(currentSkills);
        response.setRequiredSkills(requiredSkills);
        response.setMissingSkills(missingSkills);

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // Response Class
    // ==========================================
    public static class SkillGapResponse {

        private Long jobId;
        private String jobTitle;
        private List<String> currentSkills;
        private List<String> requiredSkills;
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

        public List<String> getCurrentSkills() {
            return currentSkills;
        }

        public void setCurrentSkills(List<String> currentSkills) {
            this.currentSkills = currentSkills;
        }

        public List<String> getRequiredSkills() {
            return requiredSkills;
        }

        public void setRequiredSkills(List<String> requiredSkills) {
            this.requiredSkills = requiredSkills;
        }

        public List<String> getMissingSkills() {
            return missingSkills;
        }

        public void setMissingSkills(List<String> missingSkills) {
            this.missingSkills = missingSkills;
        }
    }
}