package com.resumeiq.backend;

import com.resumeiq.backend.model.Resume;
import com.resumeiq.backend.model.TargetRole;
import com.resumeiq.backend.model.User;
import com.resumeiq.backend.repository.JobRepository;
import com.resumeiq.backend.repository.ResumeRepository;
import com.resumeiq.backend.repository.TargetRoleRepository;
import com.resumeiq.backend.repository.UserRepository;
import com.resumeiq.backend.service.ResumeAnalysisService;
import com.resumeiq.backend.service.SkillGapService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class SkillGapServiceTest {

    @Mock
    private ResumeRepository resumeRepository;
    @Mock
    private JobRepository jobRepository;
    @Mock
    private TargetRoleRepository targetRoleRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ResumeAnalysisService resumeAnalysisService;

    private SkillGapService skillGapService;

    @BeforeEach
    void setUp() {
        skillGapService = new SkillGapService(
                resumeRepository,
                jobRepository,
                targetRoleRepository,
                userRepository,
                resumeAnalysisService
        );
    }

    @Test
    void testAnalyzeSkillGapWithTargetRole() {
        // Target role: Java, Spring Boot, MySQL, Docker
        TargetRole role = new TargetRole();
        role.setId(10L);
        role.setTitle("Java Developer");
        role.setRequiredSkills("Java, Spring Boot, MySQL, Docker");

        // Resume: user has Java and Spring Boot, plus MySQL mentioned
        Resume resume = new Resume();
        resume.setId(100L);
        resume.setUserId(1L);
        resume.setExtractedText("Experienced in Java and Spring Boot development. Basic knowledge of MySQL.");

        when(resumeRepository.findById(100L)).thenReturn(Optional.of(resume));
        when(targetRoleRepository.findById(10L)).thenReturn(Optional.of(role));
        when(resumeAnalysisService.extractText(resume)).thenReturn(resume.getExtractedText());
        when(resumeAnalysisService.extractSkills(any())).thenReturn(List.of("Java", "Spring Boot", "MySQL"));

        Map<String, Object> result = skillGapService.analyzeGap(100L, 10L, null, "user@example.com");

        assertNotNull(result);
        assertEquals(100L, result.get("resumeId"));
        assertEquals("Java Developer", result.get("targetTitle"));
        assertNotNull(result.get("matchPercent"));

        @SuppressWarnings("unchecked")
        List<String> matched = (List<String>) result.get("matchedSkills");
        @SuppressWarnings("unchecked")
        List<String> missing = (List<String>) result.get("missingSkills");

        assertTrue(matched.contains("Java"));
        assertTrue(matched.contains("Spring Boot"));
        assertTrue(missing.contains("Docker"));

        @SuppressWarnings("unchecked")
        List<Map<String, String>> recommendations = (List<Map<String, String>>) result.get("recommendations");
        assertNotNull(recommendations);
        assertFalse(recommendations.isEmpty());
        // Verify Docker has learning resource recommendations
        boolean dockerFound = recommendations.stream().anyMatch(d -> "Docker".equalsIgnoreCase(d.get("skill")));
        assertTrue(dockerFound);
    }
}
