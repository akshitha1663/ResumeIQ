package com.resumeiq.backend.controller;

import com.resumeiq.backend.service.AIService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AIService aiService;

    public AiController(AIService aiService) {
        this.aiService = aiService;
    }

    /**
     * POST /api/ai/chat
     * Body: { "message": "...", "history": [{ "role": "user"|"model", "text": "..." }] }
     * Returns: { "reply": "..." }
     * Requires: authenticated (any role)
     */
    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, Object> body) {
        String message = (String) body.getOrDefault("message", "");
        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "message is required"));
        }

        @SuppressWarnings("unchecked")
        List<Map<String, String>> history =
            (List<Map<String, String>>) body.getOrDefault("history", List.of());

        String reply = aiService.chat(message.trim(), history);
        return ResponseEntity.ok(Map.of("reply", reply));
    }
}
