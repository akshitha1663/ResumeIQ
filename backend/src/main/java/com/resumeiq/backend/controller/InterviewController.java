package com.resumeiq.backend.controller;

import com.resumeiq.backend.model.InterviewSession;
import com.resumeiq.backend.service.InterviewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interview")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    private String requireUser(Principal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required.");
        }
        return principal.getName();
    }

    @PostMapping("/questions")
    public ResponseEntity<List<Map<String, Object>>> getQuestions(
            @RequestBody Map<String, String> request) {
        String roleTitle = request.getOrDefault("roleTitle", "Java Developer");
        String category = request.getOrDefault("category", "Technical");
        String difficulty = request.getOrDefault("difficulty", "Mid Level");

        return ResponseEntity.ok(interviewService.generateQuestions(roleTitle, category, difficulty));
    }

    @PostMapping("/evaluate")
    public ResponseEntity<?> evaluateSession(
            @RequestBody Map<String, Object> payload,
            Principal principal) {
        String email = requireUser(principal);

        String roleTitle = (String) payload.getOrDefault("roleTitle", "Software Developer");
        String category = (String) payload.getOrDefault("category", "Technical");
        String difficulty = (String) payload.getOrDefault("difficulty", "Mid Level");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> qaList = (List<Map<String, Object>>) payload.getOrDefault("qaList", List.of());

        try {
            InterviewSession session = interviewService.evaluateSession(roleTitle, category, difficulty, qaList, email);
            return ResponseEntity.ok(session);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<InterviewSession>> getMySessions(Principal principal) {
        String email = requireUser(principal);
        return ResponseEntity.ok(interviewService.getUserSessions(email));
    }
}
