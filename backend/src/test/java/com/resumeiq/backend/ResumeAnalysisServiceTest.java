package com.resumeiq.backend;

import com.resumeiq.backend.model.Resume;
import com.resumeiq.backend.repository.ResumeRepository;
import com.resumeiq.backend.service.AIService;
import com.resumeiq.backend.service.ResumeAnalysisService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ResumeAnalysisServiceTest {

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private AIService aiService;

    private ResumeAnalysisService resumeAnalysisService;

    @BeforeEach
    void setUp() {
        resumeAnalysisService = new ResumeAnalysisService(resumeRepository, aiService);
    }

    @Test
    void testAnalyzeResumeRubric() {
        Resume resume = new Resume();
        resume.setId(1L);
        resume.setUserId(2L);
        resume.setFileName("john_doe_resume.pdf");
        resume.setExtractedText(
            "John Doe\nEmail: john@example.com | Phone: 1234567890 | LinkedIn: linkedin.com/in/johndoe\n\n" +
            "Professional Summary:\nDedicated Java Full Stack Engineer with 3 years of experience.\n\n" +
            "Work Experience:\nSoftware Developer at Tech Innovations. Developed Spring Boot microservices.\n\n" +
            "Education:\nBachelor of Technology in Computer Science.\n\n" +
            "Projects:\nE-Commerce Platform with React, Java, and MySQL.\n\n" +
            "Certifications:\nAWS Certified Solutions Architect.\n\n" +
            "Skills: Java, Spring Boot, React, JavaScript, SQL, MySQL, Docker, Git"
        );

        when(resumeRepository.findById(1L)).thenReturn(Optional.of(resume));

        Map<String, Object> result = resumeAnalysisService.analyzeResume(1L);

        assertNotNull(result);
        assertEquals(1L, result.get("resumeId"));
        assertTrue((int) result.get("resumeScore") >= 90);

        @SuppressWarnings("unchecked")
        Map<String, Object> breakdown = (Map<String, Object>) result.get("scoreBreakdown");
        assertNotNull(breakdown);
        assertEquals(30, breakdown.get("skillsScore"));
        assertEquals(25, breakdown.get("experienceScore"));
        assertEquals(15, breakdown.get("educationScore"));
        assertEquals(15, breakdown.get("projectsScore"));
        assertEquals(5, breakdown.get("certificationsScore"));
        assertEquals(10, breakdown.get("summaryContactScore"));
        assertEquals(100, breakdown.get("totalScore"));
    }
}
