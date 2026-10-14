package com.resumeiq.backend.controller;

import com.resumeiq.backend.model.Resume;
import com.resumeiq.backend.model.User;
import com.resumeiq.backend.repository.ResumeRepository;
import com.resumeiq.backend.repository.UserRepository;
import com.resumeiq.backend.service.ResumeAnalysisService;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final ResumeAnalysisService resumeAnalysisService;

    private final Path uploadDirectory =
            Paths.get("uploads", "resumes").toAbsolutePath().normalize();

    public ResumeController(
            ResumeRepository resumeRepository,
            UserRepository userRepository,
            ResumeAnalysisService resumeAnalysisService) {
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.resumeAnalysisService = resumeAnalysisService;
    }

    // ─── Upload resume (associates with authenticated user) ───────────────────
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadResume(
            @RequestParam("file") MultipartFile file,
            Principal principal) {

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please select a resume file.");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "File size must not exceed 5 MB.");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file name.");
        }

        String lowerName = originalName.toLowerCase();
        if (!(lowerName.endsWith(".pdf") || lowerName.endsWith(".doc") || lowerName.endsWith(".docx"))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only PDF, DOC, and DOCX files are allowed.");
        }

        String storedName = UUID.randomUUID() + "_" + Paths.get(originalName).getFileName();
        Path destination = uploadDirectory.resolve(storedName).normalize();

        if (!destination.startsWith(uploadDirectory)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file path.");
        }

        try {
            Files.createDirectories(uploadDirectory);
            file.transferTo(destination);

            Resume resume = new Resume();
            resume.setFileName(Paths.get(originalName).getFileName().toString());
            resume.setFilePath(destination.toString());
            resume.setContentType(file.getContentType());

            // Associate with authenticated user if principal is available
            if (principal != null) {
                userRepository.findByEmail(principal.getName())
                        .ifPresent(u -> resume.setUserId(u.getId()));
            }

            // Immediately parse text with Apache Tika and cache in DB
            try {
                String extracted = resumeAnalysisService.extractText(resume);
                resume.setExtractedText(extracted);
            } catch (Exception ignored) {}

            Resume saved = resumeRepository.save(resume);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("id",       saved.getId());
            response.put("resumeId", saved.getId());
            response.put("fileName", saved.getFileName());
            response.put("userId",   saved.getUserId());
            response.put("message",  "Resume uploaded successfully.");
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to save resume file.");
        }
    }

    // ─── Get current user's own resumes ──────────────────────────────────────
    @GetMapping("/my")
    public ResponseEntity<List<Resume>> getMyResumes(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null) return ResponseEntity.ok(List.of());
        List<Resume> resumes = resumeRepository.findByUserIdOrderByUploadedAtDesc(user.getId());
        // Strip file paths before returning
        resumes.forEach(r -> r.setFilePath(null));
        return ResponseEntity.ok(resumes);
    }

    // ─── Get all resumes (admin use) ──────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<Resume>> getAllResumes() {
        List<Resume> all = resumeRepository.findAll();
        all.forEach(r -> r.setFilePath(null)); // never expose filesystem paths
        return ResponseEntity.ok(all);
    }

    // ─── Get current user's latest resume ────────────────────────────────────
    @GetMapping("/latest")
    public ResponseEntity<Resume> getLatestResume(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        return resumeRepository.findFirstByUserIdOrderByUploadedAtDesc(user.getId())
                .map(r -> {
                    r.setFilePath(null);
                    return ResponseEntity.ok(r);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── Analyze a resume ────────────────────────────────────────────────────
    @GetMapping("/{resumeId}/analysis")
    public ResponseEntity<Map<String, Object>> getResumeAnalysis(
            @PathVariable Long resumeId) {
        return ResponseEntity.ok(resumeAnalysisService.analyzeResume(resumeId));
    }

    // ─── Compare Resume with Job Description ──────────────────────────────────
    @PostMapping("/{resumeId}/compare-jd")
    public ResponseEntity<Map<String, Object>> compareWithJd(
            @PathVariable Long resumeId,
            @RequestBody Map<String, String> body) {
        String jd = body.getOrDefault("jobDescription", "");
        return ResponseEntity.ok(resumeAnalysisService.compareWithJobDescription(resumeId, jd));
    }

    // ─── Rewrite Bullet Point ────────────────────────────────────────────────
    @PostMapping("/rewrite-bullet")
    public ResponseEntity<Map<String, String>> rewriteBullet(
            @RequestBody Map<String, String> body) {
        String bullet = body.getOrDefault("bulletPoint", "");
        String role = body.getOrDefault("targetRole", "Software Engineer");
        return ResponseEntity.ok(resumeAnalysisService.rewriteBulletPoint(bullet, role));
    }
}