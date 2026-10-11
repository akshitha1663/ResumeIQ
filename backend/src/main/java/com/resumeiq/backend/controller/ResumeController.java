package com.resumeiq.backend.controller;

import com.resumeiq.backend.model.Resume;
import com.resumeiq.backend.repository.ResumeRepository;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeRepository resumeRepository;
    private final ResumeAnalysisService resumeAnalysisService;

    private final Path uploadDirectory =
            Paths.get("uploads", "resumes").toAbsolutePath().normalize();

    public ResumeController(
            ResumeRepository resumeRepository,
            ResumeAnalysisService resumeAnalysisService) {
        this.resumeRepository = resumeRepository;
        this.resumeAnalysisService = resumeAnalysisService;
    }

    @PostMapping(
            value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadResume(
            @RequestParam("file") MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Please select a resume file.");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new ResponseStatusException(
                    HttpStatus.PAYLOAD_TOO_LARGE,
                    "File size must not exceed 5 MB.");
        }

        String originalName = file.getOriginalFilename();

        if (originalName == null || originalName.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid file name.");
        }

        String lowerName = originalName.toLowerCase();

        if (!(lowerName.endsWith(".pdf")
                || lowerName.endsWith(".doc")
                || lowerName.endsWith(".docx"))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only PDF, DOC, and DOCX files are allowed.");
        }

        String storedName = UUID.randomUUID() + "_" +
                Paths.get(originalName).getFileName().toString();

        Path destination = uploadDirectory.resolve(storedName).normalize();

        if (!destination.startsWith(uploadDirectory)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid file path.");
        }

        try {
            Files.createDirectories(uploadDirectory);
            file.transferTo(destination);

            Resume resume = new Resume();
            resume.setFileName(Paths.get(originalName).getFileName().toString());
            resume.setFilePath(destination.toString());
            resume.setContentType(file.getContentType());

            Resume savedResume = resumeRepository.save(resume);

            Map<String, Object> response = new HashMap<>();
            response.put("id", savedResume.getId());
            response.put("resumeId", savedResume.getId());
            response.put("fileName", savedResume.getFileName());
            response.put("message", "Resume uploaded successfully.");

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to save resume file.");
        }
    }

    @GetMapping
    public ResponseEntity<List<Resume>> getAllResumes() {
        return ResponseEntity.ok(resumeRepository.findAll());
    }

    @GetMapping("/{resumeId}/analysis")
    public ResponseEntity<Map<String, Object>> getResumeAnalysis(
            @PathVariable Long resumeId) {

        return ResponseEntity.ok(
                resumeAnalysisService.analyzeResume(resumeId));
    }
}