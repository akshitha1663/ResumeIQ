package com.resumeiq.backend.controller;

import java.util.Arrays;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin("*")
public class RecommendationController {

    // ==========================================
    // Get Job Recommendations
    // ==========================================
    @GetMapping
    public ResponseEntity<List<Recommendation>> getRecommendations() {

        List<Recommendation> recommendations = Arrays.asList(

                new Recommendation(
                        1L,
                        "Java Developer",
                        "TCS",
                        "Hyderabad",
                        90,
                        "Java, Spring Boot, MySQL"
                ),

                new Recommendation(
                        2L,
                        "Full Stack Developer",
                        "Infosys",
                        "Bangalore",
                        85,
                        "Java, React, Spring Boot, MySQL"
                ),

                new Recommendation(
                        3L,
                        "React Developer",
                        "Tech Mahindra",
                        "Hyderabad",
                        80,
                        "React, JavaScript, HTML, CSS"
                )
        );

        return ResponseEntity.ok(recommendations);
    }

    // ==========================================
    // Recommendation Response
    // ==========================================
    public static class Recommendation {

        private Long id;
        private String title;
        private String company;
        private String location;
        private int matchScore;
        private String skills;

        public Recommendation(
                Long id,
                String title,
                String company,
                String location,
                int matchScore,
                String skills) {

            this.id = id;
            this.title = title;
            this.company = company;
            this.location = location;
            this.matchScore = matchScore;
            this.skills = skills;
        }

        public Long getId() {
            return id;
        }

        public String getTitle() {
            return title;
        }

        public String getCompany() {
            return company;
        }

        public String getLocation() {
            return location;
        }

        public int getMatchScore() {
            return matchScore;
        }

        public String getSkills() {
            return skills;
        }
    }
}