package com.resumeiq.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AIService {

    @Value("${ai.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${ai.gemini.model:gemini-3.5-flash-lite}")
    private String geminiModel;

    private static final String SYSTEM_CONTEXT =
        "You are an expert AI Project Assistant for ResumeIQ (an AI Resume Analysis and Job Matching platform). " +
        "You specialize in Java, Spring Boot, React, SQL, Python, resume optimization, ATS scoring, and software engineering. " +
        "You help developers and job seekers write clean code, debug issues, optimize resumes, and understand technical concepts. " +
        "Format all code examples in proper markdown code blocks with language tags. " +
        "Keep explanations concise, practical, and highly relevant.";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Send a chat message to Google Gemini and return the reply text.
     * @param userMessage  The user's latest message
     * @param history      Previous turns as [{role, text}] — optional
     */
    @SuppressWarnings("unchecked")
    public String chat(String userMessage, List<Map<String, String>> history) {
        String apiKey = resolveApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            return "⚠️ AI assistant is not configured. Please set the `GEMINI_API_KEY` environment variable on the backend and restart.";
        }

        String model = resolveModel();
        String geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

        // Build contents array using Gemini generateContent format
        List<Map<String, Object>> contents = new ArrayList<>();

        // System context initialization as first turn
        contents.add(buildTurn("user", SYSTEM_CONTEXT));
        contents.add(buildTurn("model", "Understood. I am ready to assist with ResumeIQ development, Java, Spring Boot, React, SQL, Python, and resume optimization."));

        // Inject prior conversation history (filtering error responses)
        if (history != null) {
            for (Map<String, String> turn : history) {
                String role = "user".equalsIgnoreCase(turn.get("role")) ? "user" : "model";
                String text = turn.getOrDefault("text", "");
                if (!text.isBlank() && !text.startsWith("❌") && !text.startsWith("⚠️")) {
                    contents.add(buildTurn(role, text));
                }
            }
        }

        // Add the current user message
        contents.add(buildTurn("user", userMessage));

        Map<String, Object> body = Map.of("contents", contents);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(geminiUrl, request, Map.class);

            Map<String, Object> responseBody = response.getBody();
            if (responseBody == null) {
                return "No response received from AI.";
            }

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                return "AI returned an empty response.";
            }

            Map<String, Object> firstCandidate = candidates.get(0);
            Map<String, Object> content = (Map<String, Object>) firstCandidate.get("content");
            if (content == null) {
                return "Unexpected response format from AI.";
            }

            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            if (parts == null || parts.isEmpty()) {
                return "No content parts in AI response.";
            }

            StringBuilder replyBuilder = new StringBuilder();
            for (Map<String, Object> part : parts) {
                Object textObj = part.get("text");
                if (textObj != null) {
                    replyBuilder.append(textObj.toString());
                }
            }

            String reply = replyBuilder.toString().trim();
            return reply.isEmpty() ? "AI returned an empty reply." : reply;

        } catch (HttpStatusCodeException e) {
            int statusCode = e.getStatusCode().value();
            String responseBody = e.getResponseBodyAsString();
            String errorDetail = parseGoogleErrorMessage(responseBody);

            if (statusCode == 400 || statusCode == 401) {
                return "❌ Gemini API error (" + statusCode + "): Invalid API key or request format. " + errorDetail;
            } else if (statusCode == 403) {
                return "❌ Gemini API error (403): Access denied. " + errorDetail +
                       " (Google AI Studio reports that this project was denied access; please check your project or create a fresh API key at https://aistudio.google.com/app/apikey).";
            } else if (statusCode == 404) {
                return "❌ Gemini API error (404): Model `" + model + "` not found or unavailable. " + errorDetail;
            } else if (statusCode == 429) {
                return "❌ Gemini API error (429): Quota exceeded. " + errorDetail;
            } else {
                return "❌ Gemini API error (" + statusCode + "): " + errorDetail;
            }
        } catch (ResourceAccessException e) {
            return "❌ Gemini API connection error: Failed to reach Google Gemini servers. Please check your network connection.";
        } catch (Exception e) {
            return "❌ AI service error: " + (e.getMessage() != null ? e.getMessage() : "unexpected error occurred");
        }
    }

    private String resolveApiKey() {
        String key = (this.geminiApiKey != null && !this.geminiApiKey.isBlank())
            ? this.geminiApiKey
            : System.getenv("GEMINI_API_KEY");
        if (key == null) return null;
        String cleaned = key.trim().replaceAll("^[*\"']+|[*\"']+$", "");
        // If the key was accidentally pasted twice consecutively (e.g. KEYKEY)
        if (cleaned.length() > 60 && cleaned.length() % 2 == 0) {
            String half1 = cleaned.substring(0, cleaned.length() / 2);
            String half2 = cleaned.substring(cleaned.length() / 2);
            if (half1.equals(half2)) {
                cleaned = half1;
            }
        }
        return cleaned;
    }

    private String resolveModel() {
        String model = (this.geminiModel != null && !this.geminiModel.isBlank())
            ? this.geminiModel
            : System.getenv("GEMINI_MODEL");
        return (model != null && !model.isBlank()) ? model.trim() : "gemini-3.5-flash-lite";
    }

    private String parseGoogleErrorMessage(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) return "";
        try {
            Map<?, ?> map = objectMapper.readValue(responseBody, Map.class);
            if (map.containsKey("error") && map.get("error") instanceof Map) {
                Map<?, ?> err = (Map<?, ?>) map.get("error");
                Object msg = err.get("message");
                if (msg != null && !msg.toString().isBlank()) {
                    return msg.toString();
                }
            }
        } catch (Exception ignored) {}
        return responseBody.length() > 200 ? responseBody.substring(0, 200) + "..." : responseBody;
    }

    private Map<String, Object> buildTurn(String role, String text) {
        return Map.of(
            "role", role,
            "parts", List.of(Map.of("text", text))
        );
    }
}
