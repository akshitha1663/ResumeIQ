package com.resumeiq.backend.controller;

import com.resumeiq.backend.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping("/{resumeId}")
    public ResponseEntity<List<Map<String, Object>>> recommend(
            @PathVariable Long resumeId,
            @RequestParam(defaultValue = "10") int top) {
        try {
            return ResponseEntity.ok(recommendationService.recommend(resumeId, top));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(List.of(Map.of("message", e.getMessage())));
        }
    }
}