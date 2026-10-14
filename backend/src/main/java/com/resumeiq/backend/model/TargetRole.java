package com.resumeiq.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "target_roles")
public class TargetRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String title;

    private String category;

    @Column(length = 2000)
    private String description;

    @Column(length = 2000)
    private String requiredSkills;

    @Column(length = 2000)
    private String optionalSkills;

    private String experienceLevel;

    private boolean active = true;

    public TargetRole() {
    }

    public TargetRole(String title, String category, String description,
                      String requiredSkills, String optionalSkills, String experienceLevel) {
        this.title = title;
        this.category = category;
        this.description = description;
        this.requiredSkills = requiredSkills;
        this.optionalSkills = optionalSkills;
        this.experienceLevel = experienceLevel;
        this.active = true;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(String requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public String getOptionalSkills() {
        return optionalSkills;
    }

    public void setOptionalSkills(String optionalSkills) {
        this.optionalSkills = optionalSkills;
    }

    public String getExperienceLevel() {
        return experienceLevel;
    }

    public void setExperienceLevel(String experienceLevel) {
        this.experienceLevel = experienceLevel;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
