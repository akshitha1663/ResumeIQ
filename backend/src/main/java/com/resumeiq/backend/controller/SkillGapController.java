package com.resumeiq.backend.controller;

import com.resumeiq.backend.service.SkillGapService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/skill-gap")
public class SkillGapController {

    private final SkillGapService skillGapService;

    public SkillGapController(SkillGapService skillGapService) {
        this.skillGapService = skillGapService;
    }

    /**
     * Modern flexible analysis endpoint:
     * Accepts roleId (TargetRole) OR jobId, and optionally resumeId (defaults to authenticated user's latest resume).
     */
    @GetMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyze(
            @RequestParam(required = false) Long roleId,
            @RequestParam(required = false) Long jobId,
            @RequestParam(required = false) Long resumeId,
            Principal principal) {
        try {
            String userEmail = principal != null ? principal.getName() : null;
            return ResponseEntity.ok(skillGapService.analyzeGap(resumeId, roleId, jobId, userEmail));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Backward-compatible path variable endpoint.
     */
    @GetMapping("/{resumeId}/{jobId}")
    public ResponseEntity<Map<String, Object>> analyzeLegacy(
            @PathVariable Long resumeId,
            @PathVariable Long jobId,
            Principal principal) {
        try {
            String userEmail = principal != null ? principal.getName() : null;
            return ResponseEntity.ok(skillGapService.analyzeGap(resumeId, null, jobId, userEmail));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}