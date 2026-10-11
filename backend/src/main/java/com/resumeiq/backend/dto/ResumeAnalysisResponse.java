package com.resumeiq.backend.dto;

import java.util.List;

public class ResumeAnalysisResponse {

    private String name;
    private String email;
    private String education;
    private String experience;
    private List<String> skills;
    private int score;

    public ResumeAnalysisResponse() {
    }

    public ResumeAnalysisResponse(
            String name,
            String email,
            String education,
            String experience,
            List<String> skills,
            int score) {

        this.name = name;
        this.email = email;
        this.education = education;
        this.experience = experience;
        this.skills = skills;
        this.score = score;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getEducation() {
        return education;
    }

    public void setEducation(String education) {
        this.education = education;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }
}