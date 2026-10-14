package com.resumeiq.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String company;

    private String location;

    // Full-time, Part-time, Internship, Contract, Freelance, Temporary
    private String jobType;

    // Remote, Hybrid, On-site
    private String workMode = "Remote";

    // Entry Level, Mid Level, Senior, Lead
    private String experienceLevel = "Entry Level";

    private String salary;

    private String skills;

    @Column(length = 2000)
    private String description;

    private String applyLink;

    private String postedDate = LocalDate.now().toString();

    private boolean active = true;

    // Default Constructor
    public Job() {
    }

    // Parameterized Constructor
    public Job(
            String title,
            String company,
            String location,
            String jobType,
            String salary,
            String skills,
            String description) {

        this.title = title;
        this.company = company;
        this.location = location;
        this.jobType = jobType;
        this.salary = salary;
        this.skills = skills;
        this.description = description;
        this.workMode = "Remote";
        this.experienceLevel = "Mid Level";
        this.active = true;
        this.postedDate = LocalDate.now().toString();
    }

    public Job(
            String title,
            String company,
            String location,
            String jobType,
            String workMode,
            String experienceLevel,
            String salary,
            String skills,
            String description,
            String applyLink) {

        this.title = title;
        this.company = company;
        this.location = location;
        this.jobType = jobType;
        this.workMode = workMode != null ? workMode : "Remote";
        this.experienceLevel = experienceLevel != null ? experienceLevel : "Mid Level";
        this.salary = salary;
        this.skills = skills;
        this.description = description;
        this.applyLink = applyLink;
        this.active = true;
        this.postedDate = LocalDate.now().toString();
    }

    // Getters and Setters

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

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getJobType() {
        return jobType;
    }

    public void setJobType(String jobType) {
        this.jobType = jobType;
    }

    public String getWorkMode() {
        return workMode;
    }

    public void setWorkMode(String workMode) {
        this.workMode = workMode;
    }

    public String getExperienceLevel() {
        return experienceLevel;
    }

    public void setExperienceLevel(String experienceLevel) {
        this.experienceLevel = experienceLevel;
    }

    public String getSalary() {
        return salary;
    }

    public void setSalary(String salary) {
        this.salary = salary;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getApplyLink() {
        return applyLink;
    }

    public void setApplyLink(String applyLink) {
        this.applyLink = applyLink;
    }

    public String getPostedDate() {
        return postedDate;
    }

    public void setPostedDate(String postedDate) {
        this.postedDate = postedDate;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}