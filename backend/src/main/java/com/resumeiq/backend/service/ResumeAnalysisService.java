package com.resumeiq.backend.service;

import com.resumeiq.backend.model.Resume;
import com.resumeiq.backend.repository.ResumeRepository;
import org.apache.tika.Tika;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ResumeAnalysisService {

    private final ResumeRepository resumeRepository;
    private final AIService aiService;
    private final Tika tika = new Tika();

    // Comprehensive skill keyword list (tech + soft skills)
    private static final Set<String> SKILL_KEYWORDS = new LinkedHashSet<>(Arrays.asList(
        // Programming languages
        "java", "python", "javascript", "typescript", "c++", "c#", "ruby", "go", "golang",
        "kotlin", "swift", "scala", "php", "r", "rust", "dart", "perl", "bash", "shell",
        // Web / Frontend
        "react", "angular", "vue", "nextjs", "html", "css", "sass", "tailwind", "bootstrap",
        "redux", "webpack", "vite", "jquery", "svelte",
        // Backend / Frameworks
        "spring", "spring boot", "node.js", "nodejs", "express", "django", "flask",
        "fastapi", "laravel", "rails", "asp.net", "hibernate", "jpa",
        // Databases
        "mysql", "postgresql", "mongodb", "redis", "oracle", "sqlite", "cassandra",
        "elasticsearch", "dynamodb", "firebase",
        // Cloud & DevOps
        "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "github actions",
        "ci/cd", "terraform", "ansible", "linux", "nginx", "apache",
        // Data / AI / ML
        "machine learning", "deep learning", "tensorflow", "pytorch", "pandas", "numpy",
        "scikit-learn", "nlp", "data analysis", "data science", "tableau", "power bi",
        "hadoop", "spark", "kafka",
        // Tools & Practices
        "git", "github", "gitlab", "jira", "agile", "scrum", "rest", "api", "graphql",
        "microservices", "tdd", "junit", "selenium", "postman", "maven", "gradle",
        // Soft skills
        "communication", "leadership", "teamwork", "problem solving", "critical thinking",
        "time management", "project management", "collaboration", "mentoring"
    ));

    private static final Set<String> SECTION_KEYWORDS_EXPERIENCE = new LinkedHashSet<>(
        Arrays.asList("experience", "work history", "employment", "internship", "professional experience")
    );
    private static final Set<String> SECTION_KEYWORDS_EDUCATION = new LinkedHashSet<>(
        Arrays.asList("education", "academic", "university", "college", "degree",
                      "bachelor", "master", "b.tech", "b.e", "m.tech", "b.sc", "m.sc")
    );
    private static final Set<String> SECTION_KEYWORDS_PROJECTS = new LinkedHashSet<>(
        Arrays.asList("projects", "project", "personal project", "portfolio project", "capstone")
    );
    private static final Set<String> SECTION_KEYWORDS_CERTIFICATIONS = new LinkedHashSet<>(
        Arrays.asList("certification", "certifications", "certified", "license", "credentials", "coursework")
    );
    private static final Set<String> SECTION_KEYWORDS_SUMMARY = new LinkedHashSet<>(
        Arrays.asList("summary", "objective", "profile", "about me", "career objective", "professional summary")
    );
    private static final Set<String> SECTION_KEYWORDS_CONTACT = new LinkedHashSet<>(
        Arrays.asList("email", "phone", "linkedin", "github", "contact", "address", "mobile")
    );

    public ResumeAnalysisService(ResumeRepository resumeRepository, @Lazy AIService aiService) {
        this.resumeRepository = resumeRepository;
        this.aiService = aiService;
    }

    /**
     * Extracts raw text from the file using Apache Tika.
     * Caches the result in the resume's extractedText field to avoid re-parsing.
     */
    public String extractText(Resume resume) {
        if (resume.getExtractedText() != null && !resume.getExtractedText().isBlank()) {
            return resume.getExtractedText();
        }
        try {
            if (resume.getFilePath() == null) return "";
            File file = new File(resume.getFilePath());
            if (!file.exists()) {
                return "";
            }
            String text = tika.parseToString(file);
            resume.setExtractedText(text);
            resumeRepository.save(resume);
            return text;
        } catch (Exception e) {
            return "";
        }
    }

    /**
     * Extracts skills from resume text by matching against the keyword list.
     */
    public List<String> extractSkills(String text) {
        if (text == null || text.isBlank()) return List.of();
        String lower = text.toLowerCase();
        return SKILL_KEYWORDS.stream()
                .filter(lower::contains)
                .map(this::capitalize)
                .collect(Collectors.toList());
    }

    /**
     * Main analysis entry point with transparent scoring rubric and breakdown.
     */
    public Map<String, Object> analyzeResume(Long resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found: " + resumeId));

        String text = extractText(resume);
        String lower = text.toLowerCase();

        List<String> skills = extractSkills(text);

        // Section detection
        boolean hasExperience    = SECTION_KEYWORDS_EXPERIENCE.stream().anyMatch(lower::contains);
        boolean hasEducation     = SECTION_KEYWORDS_EDUCATION.stream().anyMatch(lower::contains);
        boolean hasProjects      = SECTION_KEYWORDS_PROJECTS.stream().anyMatch(lower::contains);
        boolean hasCertifications= SECTION_KEYWORDS_CERTIFICATIONS.stream().anyMatch(lower::contains);
        boolean hasSummary       = SECTION_KEYWORDS_SUMMARY.stream().anyMatch(lower::contains);
        boolean hasContact       = SECTION_KEYWORDS_CONTACT.stream().anyMatch(lower::contains);

        // Transparent Scoring Rubric (Total 100 points)
        // 1. Skills: up to 30 points (8+ skills = full 30, otherwise proportional)
        int skillsScore = Math.min(30, skills.size() * 4);

        // 2. Experience: 25 points
        int experienceScore = hasExperience ? 25 : 0;

        // 3. Education: 15 points
        int educationScore = hasEducation ? 15 : 0;

        // 4. Projects: 15 points
        int projectsScore = hasProjects ? 15 : 0;

        // 5. Certifications: 5 points
        int certificationsScore = hasCertifications ? 5 : 0;

        // 6. Summary & Contact: 10 points (5 for summary, 5 for contact)
        int summaryContactScore = (hasSummary ? 5 : 0) + (hasContact ? 5 : 0);

        int totalScore = skillsScore + experienceScore + educationScore +
                         projectsScore + certificationsScore + summaryContactScore;

        Map<String, Object> scoreBreakdown = new LinkedHashMap<>();
        scoreBreakdown.put("skillsScore", skillsScore);
        scoreBreakdown.put("skillsMax", 30);
        scoreBreakdown.put("experienceScore", experienceScore);
        scoreBreakdown.put("experienceMax", 25);
        scoreBreakdown.put("educationScore", educationScore);
        scoreBreakdown.put("educationMax", 15);
        scoreBreakdown.put("projectsScore", projectsScore);
        scoreBreakdown.put("projectsMax", 15);
        scoreBreakdown.put("certificationsScore", certificationsScore);
        scoreBreakdown.put("certificationsMax", 5);
        scoreBreakdown.put("summaryContactScore", summaryContactScore);
        scoreBreakdown.put("summaryContactMax", 10);
        scoreBreakdown.put("totalScore", totalScore);

        // Detailed strengths & actionable improvements
        List<String> strengths = new ArrayList<>();
        List<String> improvements = new ArrayList<>();

        if (skills.size() >= 8) strengths.add(skills.size() + " relevant technical and soft skills identified");
        else improvements.add("Add more technical keywords relevant to your target role (currently found " + skills.size() + ")");

        if (hasExperience) strengths.add("Work Experience section clearly structured");
        else improvements.add("Include a dedicated Work Experience or Internship section with measurable impact");

        if (hasProjects) strengths.add("Projects section found showcasing practical portfolio work");
        else improvements.add("Add a Projects section with live demo links, technologies used, and GitHub repos");

        if (hasEducation) strengths.add("Educational qualifications and degrees present");
        else improvements.add("Include education history with degree title, institution, and graduation year");

        if (hasCertifications) strengths.add("Industry certifications or specialized coursework listed");
        else improvements.add("Consider adding relevant cloud or framework certifications to stand out");

        if (hasSummary) strengths.add("Professional summary or career objective present");
        else improvements.add("Add a 2-3 sentence executive summary highlighting your key achievements");

        if (hasContact) strengths.add("Contact details (email, phone, LinkedIn/GitHub) detected");
        else improvements.add("Include professional links: GitHub, LinkedIn, email, and phone");

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("resumeId",           resume.getId());
        result.put("fileName",           resume.getFileName());
        result.put("resumeScore",        totalScore);
        result.put("scoreBreakdown",     scoreBreakdown);
        result.put("skills",             skills);
        result.put("strengths",          strengths);
        result.put("improvements",       improvements);
        result.put("hasExperience",      hasExperience);
        result.put("hasEducation",       hasEducation);
        result.put("hasProjects",        hasProjects);
        result.put("hasCertifications",  hasCertifications);
        result.put("hasSummary",         hasSummary);
        result.put("hasContact",         hasContact);
        result.put("analysisNote",       "Score calculated using a transparent 100-point rubric: Skills (30 pts), Experience (25 pts), Projects (15 pts), Education (15 pts), Summary & Contact (10 pts), Certifications (5 pts).");
        result.put("status", text.isBlank()
                ? "Text extraction failed – file may be image-based or corrupted"
                : "Analysis complete");

        return result;
    }

    /**
     * Compare resume with a target Job Description to highlight matched and missing keywords.
     */
    public Map<String, Object> compareWithJobDescription(Long resumeId, String jobDescription) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found: " + resumeId));

        String text = extractText(resume);
        String resumeLower = text.toLowerCase();

        List<String> jdSkills = extractSkills(jobDescription);
        List<String> matched = jdSkills.stream()
                .filter(s -> resumeLower.contains(s.toLowerCase()))
                .collect(Collectors.toList());

        List<String> missing = jdSkills.stream()
                .filter(s -> !resumeLower.contains(s.toLowerCase()))
                .collect(Collectors.toList());

        int matchPercent = jdSkills.isEmpty() ? 0 : (matched.size() * 100) / jdSkills.size();

        Map<String, Object> comparison = new LinkedHashMap<>();
        comparison.put("resumeId", resumeId);
        comparison.put("matchPercent", matchPercent);
        comparison.put("matchedKeywords", matched);
        comparison.put("missingKeywords", missing);
        comparison.put("recommendation", missing.isEmpty()
                ? "Your resume strongly aligns with this job description!"
                : "Consider naturally integrating the missing keywords into your experience bullet points or skills section.");

        return comparison;
    }

    /**
     * Rewrite an individual resume bullet point using XYZ formula (Accomplished X by doing Y measured by Z).
     */
    public Map<String, String> rewriteBulletPoint(String bulletPoint, String targetRole) {
        if (bulletPoint == null || bulletPoint.trim().isBlank()) {
            return Map.of("rewritten", "Please provide a bullet point to rewrite.");
        }

        String prompt = String.format(
            "You are an ATS resume optimization expert. Rewrite the following bullet point for a %s role " +
            "to make it more impactful, metric-driven, and action-oriented using strong action verbs. " +
            "Do NOT fabricate false company names or fake credentials. " +
            "Provide two polished versions (Option 1: Concise, Option 2: Metric-focused). " +
            "Original bullet point: \"%s\"",
            (targetRole != null && !targetRole.isBlank()) ? targetRole : "Software Engineer",
            bulletPoint
        );

        String response = aiService.chat(prompt, List.of());
        return Map.of(
            "original", bulletPoint,
            "suggestion", response
        );
    }

    private String capitalize(String s) {
        if (s == null || s.isBlank()) return s;
        String[] words = s.split(" ");
        StringBuilder sb = new StringBuilder();
        for (String w : words) {
            if (!w.isBlank())
                sb.append(Character.toUpperCase(w.charAt(0))).append(w.substring(1)).append(" ");
        }
        return sb.toString().trim();
    }
}