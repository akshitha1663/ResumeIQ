package com.resumeiq.backend.controller;

import com.resumeiq.backend.model.LearningRoadmap;
import com.resumeiq.backend.service.RoadmapService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/roadmaps")
public class RoadmapController {

    private final RoadmapService roadmapService;

    public RoadmapController(RoadmapService roadmapService) {
        this.roadmapService = roadmapService;
    }

    private String requireUser(Principal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required.");
        }
        return principal.getName();
    }

    @GetMapping
    public ResponseEntity<List<LearningRoadmap>> getMyRoadmaps(Principal principal) {
        String email = requireUser(principal);
        return ResponseEntity.ok(roadmapService.getUserRoadmaps(email));
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateRoadmap(
            @RequestBody Map<String, Object> payload,
            Principal principal) {
        String email = requireUser(principal);

        if (!payload.containsKey("targetRoleId")) {
            return ResponseEntity.badRequest().body(Map.of("message", "targetRoleId is required."));
        }

        Long targetRoleId = Long.valueOf(payload.get("targetRoleId").toString());
        int durationDays = payload.containsKey("durationDays")
                ? Integer.parseInt(payload.get("durationDays").toString())
                : 30;

        try {
            return ResponseEntity.ok(roadmapService.generateRoadmap(targetRoleId, durationDays, email));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/tasks/{taskId}/toggle")
    public ResponseEntity<?> toggleTask(
            @PathVariable Long id,
            @PathVariable String taskId,
            Principal principal) {
        String email = requireUser(principal);
        try {
            return ResponseEntity.ok(roadmapService.toggleTask(id, taskId, email));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
