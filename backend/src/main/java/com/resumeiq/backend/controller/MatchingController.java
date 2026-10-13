package com.resumeiq.backend.controller;

import com.resumeiq.backend.service.MatchingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/matching")
public class MatchingController {

    private final MatchingService matchingService;

    public MatchingController(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    @GetMapping("/{resumeId}/{jobId}")
    public ResponseEntity<Map<String, Object>> calculateMatch(
            @PathVariable Long resumeId,
            @PathVariable Long jobId) {
        try {
            return ResponseEntity.ok(matchingService.calculateMatch(resumeId, jobId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}