package com.resumeiq.backend.dto;

import java.util.List;

public class SkillsResponse {

    private List<String> technicalSkills;
    private List<String> softSkills;

    public SkillsResponse() {
    }

    public SkillsResponse(
            List<String> technicalSkills,
            List<String> softSkills) {

        this.technicalSkills = technicalSkills;
        this.softSkills = softSkills;
    }

    public List<String> getTechnicalSkills() {
        return technicalSkills;
    }

    public void setTechnicalSkills(List<String> technicalSkills) {
        this.technicalSkills = technicalSkills;
    }

    public List<String> getSoftSkills() {
        return softSkills;
    }

    public void setSoftSkills(List<String> softSkills) {
        this.softSkills = softSkills;
    }
}