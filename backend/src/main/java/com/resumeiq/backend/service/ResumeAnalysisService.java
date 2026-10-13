package com.resumeiq.backend.service;

import com.resumeiq.backend.model.Resume;
import com.resumeiq.backend.repository.ResumeRepository;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ResumeAnalysisService {

    private final ResumeRepository resumeRepository;
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
        Arrays.asList("experience", "work history", "employment", "internship", "project",
                      "projects", "professional experience")
    );
    private static final Set<String> SECTION_KEYWORDS_EDUCATION = new LinkedHashSet<>(
        Arrays.asList("education", "academic", "university", "college", "degree",
                      "bachelor", "master", "b.tech", "b.e", "m.tech", "b.sc", "m.sc")
    );
    private static final Set<String> SECTION_KEYWORDS_SUMMARY = new LinkedHashSet<>(
        Arrays.asList("summary", "objective", "profile", "about me", "career objective",
                      "professional summary")
    );
    private static final Set<String> SECTION_KEYWORDS_CONTACT = new LinkedHashSet<>(
        Arrays.asList("email", "phone", "linkedin", "github", "contact", "address", "mobile")
    );

    public ResumeAnalysisService(ResumeRepository resumeRepository) {
        this.resumeRepository = resumeRepository;
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
                .map(skill -> capitalize(skill))
                .collect(Collectors.toList());
    }

    /**
     * Main analysis entry point. Returns full analysis map.
     */
    public Map<String, Object> analyzeResume(Long resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found: " + resumeId));

        String text = extractText(resume);
        String lower = text.toLowerCase();

        List<String> skills = extractSkills(text);

        // Section detection
        boolean hasExperience = SECTION_KEYWORDS_EXPERIENCE.stream().anyMatch(lower::contains);
        boolean hasEducation  = SECTION_KEYWORDS_EDUCATION.stream().anyMatch(lower::contains);
        boolean hasSummary    = SECTION_KEYWORDS_SUMMARY.stream().anyMatch(lower::contains);
        boolean hasContact    = SECTION_KEYWORDS_CONTACT.stream().anyMatch(lower::contains);


        // Transparent scoring rubric (total 100)
        int skillScore      = Math.min(skills.size() * 4, 40); // up to 40 pts (10 skills = full)
        int experienceScore = hasExperience ? 20 : 0;          // 20 pts
        int educationScore  = hasEducation  ? 15 : 0;          // 15 pts
        int summaryScore    = hasSummary    ? 15 : 0;          // 15 pts
        int contactScore    = hasContact    ? 10 : 0;          // 10 pts
        int totalScore      = skillScore + experienceScore + educationScore + summaryScore + contactScore;

        // Strengths & improvements
        List<String> strengths = new ArrayList<>();
        List<String> improvements = new ArrayList<>();

        if (hasExperience) strengths.add("Experience section clearly present");
        else improvements.add("Add a dedicated Work Experience or Projects section");

        if (hasEducation) strengths.add("Education background included");
        else improvements.add("Include your Education details (degree, institution, year)");

        if (hasSummary) strengths.add("Professional summary/objective present");
        else improvements.add("Add a brief Professional Summary at the top");

        if (hasContact) strengths.add("Contact information found");
        else improvements.add("Add contact details: email, phone, LinkedIn, or GitHub");

        if (skills.size() >= 5) strengths.add(skills.size() + " relevant skills identified");
        else improvements.add("List more technical and soft skills (aim for 8 to 12)");

        if (text.length() > 200 && text.length() < 5000)
            strengths.add("Resume length is within the recommended range");
        else if (text.length() >= 5000)
            improvements.add("Resume may be too long; try to keep it concise (1–2 pages)");
        else
            improvements.add("Resume content seems very short; add more detail");

        // Analysis note
        String analysisNote = "Scored by rule-based analysis using Apache Tika text extraction. " +
                "Score criteria: Skills (40 pts), Experience (20 pts), Education (15 pts), Summary (15 pts), Contact (10 pts).";

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("resumeId",      resume.getId());
        result.put("fileName",      resume.getFileName());
        result.put("resumeScore",   totalScore);
        result.put("skills",        skills);
        result.put("strengths",     strengths);
        result.put("improvements",  improvements);
        result.put("hasExperience", hasExperience);
        result.put("hasEducation",  hasEducation);
        result.put("hasSummary",    hasSummary);
        result.put("analysisNote",  analysisNote);
        result.put("status",        text.isBlank()
                ? "Text extraction failed – file may be image-based or corrupted"
                : "Analysis complete");
        return result;
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