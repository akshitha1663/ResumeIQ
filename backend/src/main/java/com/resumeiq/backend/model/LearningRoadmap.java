package com.resumeiq.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "learning_roadmaps")
public class LearningRoadmap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    private Long targetRoleId;

    private String roleTitle;

    // 30 or 60
    private int durationDays = 30;

    @Column(columnDefinition = "TEXT")
    private String roadmapJson;

    @Column(columnDefinition = "TEXT")
    private String completedTaskIds = "";

    private int progressPercent = 0;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public LearningRoadmap() {
    }

    public LearningRoadmap(Long userId, Long targetRoleId, String roleTitle, int durationDays, String roadmapJson) {
        this.userId = userId;
        this.targetRoleId = targetRoleId;
        this.roleTitle = roleTitle;
        this.durationDays = durationDays;
        this.roadmapJson = roadmapJson;
        this.completedTaskIds = "";
        this.progressPercent = 0;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
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

    public Long getTargetRoleId() {
        return targetRoleId;
    }

    public void setTargetRoleId(Long targetRoleId) {
        this.targetRoleId = targetRoleId;
    }

    public String getRoleTitle() {
        return roleTitle;
    }

    public void setRoleTitle(String roleTitle) {
        this.roleTitle = roleTitle;
    }

    public int getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(int durationDays) {
        this.durationDays = durationDays;
    }

    public String getRoadmapJson() {
        return roadmapJson;
    }

    public void setRoadmapJson(String roadmapJson) {
        this.roadmapJson = roadmapJson;
    }

    public String getCompletedTaskIds() {
        return completedTaskIds;
    }

    public void setCompletedTaskIds(String completedTaskIds) {
        this.completedTaskIds = completedTaskIds;
    }

    public int getProgressPercent() {
        return progressPercent;
    }

    public void setProgressPercent(int progressPercent) {
        this.progressPercent = progressPercent;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
