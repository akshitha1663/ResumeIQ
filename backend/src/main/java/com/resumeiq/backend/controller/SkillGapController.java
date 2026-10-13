package com.resumeiq.backend.controller;

import com.resumeiq.backend.service.SkillGapService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/skill-gap")
public class SkillGapController {

    private final SkillGapService skillGapService;

    public SkillGapController(SkillGapService skillGapService) {
        this.skillGapService = skillGapService;
    }

    @GetMapping("/{resumeId}/{jobId}")
    public ResponseEntity<Map<String, Object>> analyzeGap(
            @PathVariable Long resumeId,
            @PathVariable Long jobId) {
        try {
            return ResponseEntity.ok(skillGapService.analyzeGap(resumeId, jobId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}