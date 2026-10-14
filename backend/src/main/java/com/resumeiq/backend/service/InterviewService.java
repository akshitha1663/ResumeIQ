package com.resumeiq.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeiq.backend.model.InterviewSession;
import com.resumeiq.backend.model.User;
import com.resumeiq.backend.repository.InterviewSessionRepository;
import com.resumeiq.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class InterviewService {

    private final InterviewSessionRepository interviewRepository;
    private final UserRepository userRepository;
    private final AIService aiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public InterviewService(InterviewSessionRepository interviewRepository,
                            UserRepository userRepository,
                            AIService aiService) {
        this.interviewRepository = interviewRepository;
        this.userRepository = userRepository;
        this.aiService = aiService;
    }

    public List<Map<String, Object>> generateQuestions(String roleTitle, String category, String difficulty) {
        String cat = (category != null && !category.isBlank()) ? category : "Technical";
        String diff = (difficulty != null && !difficulty.isBlank()) ? difficulty : "Mid Level";
        String role = (roleTitle != null && !roleTitle.isBlank()) ? roleTitle : "Software Developer";

        // Try AI question generation first
        try {
            String prompt = String.format(
                "Generate exactly 5 realistic %s interview questions for a %s position at %s difficulty. " +
                "Respond ONLY with a JSON array of objects with keys 'id' (number 1 to 5), 'question' (string), and 'focusArea' (string). " +
                "Do not include any markdown wrappers or preamble.",
                cat, role, diff
            );

            String aiResponse = aiService.chat(prompt, List.of());
            if (aiResponse != null && aiResponse.contains("[") && aiResponse.contains("]")) {
                int start = aiResponse.indexOf("[");
                int end = aiResponse.lastIndexOf("]") + 1;
                String jsonSubstring = aiResponse.substring(start, end);
                return objectMapper.readValue(jsonSubstring, new TypeReference<List<Map<String, Object>>>() {});
            }
        } catch (Exception ignored) {
            // Fall back to robust pre-built bank below
        }

        return getFallbackQuestions(role, cat, diff);
    }

    public InterviewSession evaluateSession(String roleTitle, String category, String difficulty,
                                           List<Map<String, Object>> qaList, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        List<Map<String, Object>> feedback = new ArrayList<>();
        int totalScore = 0;

        for (Map<String, Object> qa : qaList) {
            String q = (String) qa.getOrDefault("question", "");
            String a = (String) qa.getOrDefault("answer", "");

            int scoreForQ = evaluateAnswerScore(a);
            totalScore += scoreForQ;

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("question", q);
            item.put("answer", a);
            item.put("score", scoreForQ);

            if (a.trim().length() < 20) {
                item.put("strengths", "Direct initial thought.");
                item.put("improvement", "Provide concrete examples, mention technical tools or methodologies, and use the STAR method (Situation, Task, Action, Result).");
                item.put("exampleAnswer", "A strong answer should highlight real projects, explain architectural decisions, and quantify results (e.g. 'reduced latency by 35%').");
            } else {
                item.put("strengths", "Good structured response covering the core concepts.");
                item.put("improvement", "Deepen the explanation by addressing edge cases, scalability trade-offs, and lessons learned from failure.");
                item.put("exampleAnswer", "A top-tier answer bridges technical accuracy with business value and team collaboration.");
            }

            feedback.add(item);
        }

        int finalScore = qaList.isEmpty() ? 0 : totalScore / qaList.size();

        try {
            String questionsJson = objectMapper.writeValueAsString(qaList);
            String feedbackJson = objectMapper.writeValueAsString(feedback);

            InterviewSession session = new InterviewSession(
                user.getId(),
                roleTitle,
                category,
                difficulty,
                questionsJson,
                questionsJson,
                feedbackJson,
                finalScore
            );

            return interviewRepository.save(session);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save interview session: " + e.getMessage());
        }
    }

    public List<InterviewSession> getUserSessions(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));
        return interviewRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    private int evaluateAnswerScore(String answer) {
        if (answer == null || answer.trim().isEmpty()) return 20;
        int len = answer.trim().length();
        if (len < 50) return 45;
        if (len < 150) return 70;
        if (len < 300) return 85;
        return 92;
    }

    private List<Map<String, Object>> getFallbackQuestions(String role, String category, String difficulty) {
        List<Map<String, Object>> list = new ArrayList<>();
        list.add(Map.of(
            "id", 1,
            "question", "Can you explain your experience with " + role + " and describe a challenging technical problem you solved?",
            "focusArea", "Core Architecture & Problem Solving"
        ));
        list.add(Map.of(
            "id", 2,
            "question", "How do you ensure code quality, test coverage, and maintainability in production environments?",
            "focusArea", "Testing & Reliability"
        ));
        list.add(Map.of(
            "id", 3,
            "question", "Describe how you approach debugging a high-latency issue or critical bug in a live application.",
            "focusArea", "Diagnostics & Performance"
        ));
        list.add(Map.of(
            "id", 4,
            "question", "How do you manage disagreements with team members or stakeholders regarding technical trade-offs?",
            "focusArea", "Collaboration & Communication"
        ));
        list.add(Map.of(
            "id", 5,
            "question", "Where do you see technology heading in this field, and what new tools or frameworks are you learning?",
            "focusArea", "Continuous Learning & Growth"
        ));
        return list;
    }
}
