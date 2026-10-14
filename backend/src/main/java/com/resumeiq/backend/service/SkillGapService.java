package com.resumeiq.backend.service;

import com.resumeiq.backend.model.Job;
import com.resumeiq.backend.model.Resume;
import com.resumeiq.backend.model.TargetRole;
import com.resumeiq.backend.model.User;
import com.resumeiq.backend.repository.JobRepository;
import com.resumeiq.backend.repository.ResumeRepository;
import com.resumeiq.backend.repository.TargetRoleRepository;
import com.resumeiq.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SkillGapService {

    private final ResumeRepository resumeRepository;
    private final JobRepository jobRepository;
    private final TargetRoleRepository targetRoleRepository;
    private final UserRepository userRepository;
    private final ResumeAnalysisService resumeAnalysisService;

    // Curated learning resources and recommended portfolio projects
    private static final Map<String, Map<String, String>> SKILL_GUIDES = new HashMap<>();

    static {
        registerGuide("java", "Java Programming Masterclass (Oracle / MOOC.fi)",
                "https://dev.java/learn/",
                "Build an Enterprise Banking REST API with Spring Boot, JPA, and JUnit tests.");
        registerGuide("spring boot", "Spring Boot Official Guides & Baeldung",
                "https://spring.io/guides",
                "Create a multi-module microservice with Spring Security, Redis caching, and MySQL.");
        registerGuide("react", "React Official Documentation & Interactive Tutorials",
                "https://react.dev/learn",
                "Build a Real-Time Project Management Kanban Board with drag-and-drop and state management.");
        registerGuide("javascript", "Modern JavaScript (MDN Web Docs / javascript.info)",
                "https://javascript.info/",
                "Develop an asynchronous stock portfolio tracker querying third-party REST APIs.");
        registerGuide("typescript", "TypeScript Handbook & Practical Type Systems",
                "https://www.typescriptlang.org/docs/handbook/intro.html",
                "Refactor a vanilla JS web app to strict TypeScript with custom interfaces and generics.");
        registerGuide("python", "Python Official Tutorial & Real Python",
                "https://docs.python.org/3/tutorial/",
                "Build an automated data extraction and web-scraping pipeline with scheduled ETL runs.");
        registerGuide("docker", "Docker Getting Started Guide & Labs",
                "https://docs.docker.com/get-started/",
                "Containerize a full-stack Spring Boot + React application with multi-stage builds.");
        registerGuide("kubernetes", "Kubernetes Basics & Hands-On Labs",
                "https://kubernetes.io/docs/tutorials/kubernetes-basics/",
                "Deploy a microservices cluster on Minikube with Helm charts, Ingress, and auto-scaling.");
        registerGuide("aws", "AWS Skill Builder & Cloud Practitioner Guides",
                "https://aws.amazon.com/training/digital/",
                "Architect a serverless image thumbnail generator using S3, Lambda, and API Gateway.");
        registerGuide("sql", "SQLZoo & Mode Analytics SQL Guide",
                "https://sqlzoo.net/",
                "Design and optimize a 10-table normalized relational schema with indexing and query tuning.");
        registerGuide("mysql", "MySQL Reference Manual & Query Optimization",
                "https://dev.mysql.com/doc/",
                "Implement database replication, connection pooling, and complex analytical views.");
        registerGuide("machine learning", "fast.ai Practical Deep Learning & Scikit-Learn Docs",
                "https://www.fast.ai/",
                "Train and deploy a customer churn prediction model with precision/recall evaluation.");
        registerGuide("selenium", "Selenium Web Driver & Test Automation University",
                "https://testautomationu.applitools.com/",
                "Write an automated end-to-end regression test suite for a user registration and checkout flow.");
        registerGuide("html", "MDN Web Docs HTML5 Semantic Elements",
                "https://developer.mozilla.org/en-US/docs/Web/HTML",
                "Build an accessible, WCAG-compliant portfolio page using semantic HTML5 tags.");
        registerGuide("css", "CSS-Tricks Flexbox & CSS Grid Complete Guides",
                "https://css-tricks.com/snippets/css/a-guide-to-flexbox/",
                "Create a responsive, glassmorphic dark-mode dashboard without any CSS frameworks.");
        registerGuide("git", "Pro Git Book (Scott Chacon) & GitHub Skills",
                "https://git-scm.com/book/en/v2",
                "Demonstrate Git feature-branch workflows, rebasing, pull requests, and merge conflict resolution.");
        registerGuide("tailwind", "Tailwind CSS Official Documentation & Components",
                "https://tailwindcss.com/docs",
                "Style a complete SaaS landing page with responsive breakpoints and customized theme tokens.");
        registerGuide("ci/cd", "GitHub Actions & Jenkins Pipeline Tutorials",
                "https://docs.github.com/en/actions",
                "Create a CI/CD pipeline that automatically builds, tests, and deploys Docker images on git push.");
    }

    private static void registerGuide(String skill, String resource, String link, String project) {
        SKILL_GUIDES.put(skill.toLowerCase(), Map.of(
            "resource", resource,
            "link", link,
            "project", project
        ));
    }

    public SkillGapService(ResumeRepository resumeRepository,
                           JobRepository jobRepository,
                           TargetRoleRepository targetRoleRepository,
                           UserRepository userRepository,
                           ResumeAnalysisService resumeAnalysisService) {
        this.resumeRepository = resumeRepository;
        this.jobRepository = jobRepository;
        this.targetRoleRepository = targetRoleRepository;
        this.userRepository = userRepository;
        this.resumeAnalysisService = resumeAnalysisService;
    }

    public Map<String, Object> analyzeGap(Long resumeId, Long targetRoleId, Long jobId, String userEmail) {
        // Resolve resume: use specified resumeId, or automatically pick user's latest resume
        Resume resume = null;
        if (resumeId != null && resumeId > 0) {
            resume = resumeRepository.findById(resumeId).orElse(null);
        }

        if (resume == null && userEmail != null && !userEmail.isBlank()) {
            User user = userRepository.findByEmail(userEmail).orElse(null);
            if (user != null) {
                resume = resumeRepository.findFirstByUserIdOrderByUploadedAtDesc(user.getId()).orElse(null);
            }
        }

        if (resume == null) {
            throw new RuntimeException("No resume found. Please upload your latest resume to perform skill gap analysis.");
        }

        // Extract skills from resume
        String text = resumeAnalysisService.extractText(resume);
        List<String> resumeSkills = resumeAnalysisService.extractSkills(text);
        Set<String> resumeLower = resumeSkills.stream()
                .map(String::toLowerCase)
                .map(String::trim)
                .collect(Collectors.toSet());

        // Resolve target requirements: TargetRole takes priority, then Job
        String targetTitle;
        String targetCategory = "Career Track";
        List<String> requiredSkills = new ArrayList<>();
        List<String> optionalSkills = new ArrayList<>();

        if (targetRoleId != null && targetRoleId > 0) {
            TargetRole role = targetRoleRepository.findById(targetRoleId)
                    .orElseThrow(() -> new RuntimeException("Target role not found: " + targetRoleId));
            targetTitle = role.getTitle();
            targetCategory = role.getCategory() != null ? role.getCategory() : "Career Track";
            requiredSkills = MatchingService.parseSkills(role.getRequiredSkills());
            if (role.getOptionalSkills() != null) {
                optionalSkills = MatchingService.parseSkills(role.getOptionalSkills());
            }
        } else if (jobId != null && jobId > 0) {
            Job job = jobRepository.findById(jobId)
                    .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));
            targetTitle = job.getTitle() + " @ " + job.getCompany();
            targetCategory = job.getJobType() != null ? job.getJobType() : "Job Listing";
            requiredSkills = MatchingService.parseSkills(job.getSkills());
        } else {
            throw new RuntimeException("Please select a target career role or job to analyze.");
        }

        // Categorize skills into Matched, Needs Improvement, and Missing
        List<String> matched = new ArrayList<>();
        List<String> needsImprovement = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String req : requiredSkills) {
            String lower = req.toLowerCase().trim();
            if (resumeLower.contains(lower)) {
                matched.add(req);
            } else if (hasPartialEvidence(lower, text)) {
                needsImprovement.add(req);
            } else {
                missing.add(req);
            }
        }

        // Optional / bonus skills matched
        List<String> optionalMatched = new ArrayList<>();
        for (String opt : optionalSkills) {
            if (resumeLower.contains(opt.toLowerCase().trim())) {
                optionalMatched.add(opt);
            }
        }

        // Match calculation: matched full credit, needs-improvement half credit (0.5)
        int totalRequired = requiredSkills.isEmpty() ? 1 : requiredSkills.size();
        double earnedPoints = matched.size() + (needsImprovement.size() * 0.5);
        int matchPercent = Math.min(100, (int) Math.round((earnedPoints * 100.0) / totalRequired));

        String calculationExplanation = String.format(
            "Match score of %d%% is based on %d core required skills: %d directly matched (full credit), " +
            "%d needing improvement (partial credit), and %d missing. Evidence is extracted from your latest resume (%s).",
            matchPercent, requiredSkills.size(), matched.size(), needsImprovement.size(), missing.size(), resume.getFileName()
        );

        // Learning resources & recommended projects for missing and needs-improvement skills
        List<Map<String, String>> recommendations = new ArrayList<>();
        List<String> skillsToLearn = new ArrayList<>(missing);
        skillsToLearn.addAll(needsImprovement);

        for (String skill : skillsToLearn) {
            String lower = skill.toLowerCase().trim();
            Map<String, String> guide = SKILL_GUIDES.get(lower);

            Map<String, String> rec = new LinkedHashMap<>();
            rec.put("skill", skill);
            rec.put("status", missing.contains(skill) ? "Missing" : "Needs Improvement");

            if (guide != null) {
                rec.put("resource", guide.get("resource"));
                rec.put("link", guide.get("link"));
                rec.put("project", guide.get("project"));
            } else {
                rec.put("resource", "Explore " + skill + " official documentation and free learning tracks");
                rec.put("link", "https://www.google.com/search?q=" + skill.replace(" ", "+") + "+documentation+tutorial");
                rec.put("project", "Build a practical mini-project showcasing " + skill + " integration in your portfolio.");
            }
            recommendations.add(rec);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("resumeId",               resume.getId());
        result.put("resumeFileName",         resume.getFileName());
        result.put("targetTitle",            targetTitle);
        result.put("targetCategory",         targetCategory);
        result.put("targetRoleId",           targetRoleId);
        result.put("jobId",                  jobId);
        result.put("matchPercent",           matchPercent);
        result.put("calculationExplanation", calculationExplanation);
        result.put("totalRequiredSkills",    requiredSkills.size());
        result.put("matchedSkills",          matched);
        result.put("needsImprovementSkills", needsImprovement);
        result.put("missingSkills",          missing);
        result.put("optionalMatchedSkills",  optionalMatched);
        result.put("extractedResumeSkills",  resumeSkills);
        result.put("recommendations",        recommendations);

        return result;
    }

    private boolean hasPartialEvidence(String skill, String text) {
        if (text == null || text.isBlank()) return false;
        String lower = text.toLowerCase();
        // Check for root or companion keywords
        if (skill.contains(" ")) {
            String[] parts = skill.split(" ");
            for (String part : parts) {
                if (part.length() > 3 && lower.contains(part)) {
                    return true;
                }
            }
        }
        return false;
    }
}
