package com.resumeiq.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interview_sessions")
public class InterviewSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    private String roleTitle;

    // Technical, Behavioral, HR, Comprehensive
    private String category = "Technical";

    // Entry Level, Mid Level, Senior
    private String difficulty = "Mid Level";

    @Column(columnDefinition = "TEXT")
    private String questionsJson;

    @Column(columnDefinition = "TEXT")
    private String answersJson;

    @Column(columnDefinition = "TEXT")
    private String feedbackJson;

    private int score = 0;

    private String status = "Completed";

    private LocalDateTime createdAt = LocalDateTime.now();

    public InterviewSession() {
    }

    public InterviewSession(Long userId, String roleTitle, String category, String difficulty,
                            String questionsJson, String answersJson, String feedbackJson, int score) {
        this.userId = userId;
        this.roleTitle = roleTitle;
        this.category = category;
        this.difficulty = difficulty;
        this.questionsJson = questionsJson;
        this.answersJson = answersJson;
        this.feedbackJson = feedbackJson;
        this.score = score;
        this.status = "Completed";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getRoleTitle() {
        return roleTitle;
    }

    public void setRoleTitle(String roleTitle) {
        this.roleTitle = roleTitle;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getQuestionsJson() {
        return questionsJson;
    }

    public void setQuestionsJson(String questionsJson) {
        this.questionsJson = questionsJson;
    }

    public String getAnswersJson() {
        return answersJson;
    }

    public void setAnswersJson(String answersJson) {
        this.answersJson = answersJson;
    }

    public String getFeedbackJson() {
        return feedbackJson;
    }

    public void setFeedbackJson(String feedbackJson) {
        this.feedbackJson = feedbackJson;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
