package com.resumeiq.backend.service;

import java.util.Arrays;

import org.springframework.stereotype.Service;

import com.resumeiq.backend.dto.SkillsResponse;

@Service
public class SkillService {

    public SkillsResponse getSkills() {

        SkillsResponse skills = new SkillsResponse();

        skills.setTechnicalSkills(
                Arrays.asList(
                        "Java",
                        "React",
                        "Spring Boot",
                        "MySQL"
                )
        );

        skills.setSoftSkills(
                Arrays.asList(
                        "Communication",
                        "Teamwork",
                        "Problem Solving"
                )
        );

        return skills;
    }
}