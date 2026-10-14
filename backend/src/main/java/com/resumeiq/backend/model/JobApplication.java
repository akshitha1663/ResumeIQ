package com.resumeiq.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "job_applications")
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    private Long jobId;

    private String jobTitle;

    private String company;

    private String location;

    private String appliedDate;

    // Saved, Applied, Interview, Offer, Rejected
    private String status = "Applied";

    @Column(length = 2000)
    private String notes;

    public JobApplication() {
    }

    public JobApplication(
            Long userId,
            Long jobId,
            String jobTitle,
            String company,
            String location,
            String appliedDate,
            String status) {

        this.userId = userId;
        this.jobId = jobId;
        this.jobTitle = jobTitle;
        this.company = company;
        this.location = location;
        this.appliedDate = appliedDate;
        this.status = status != null ? status : "Applied";
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

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
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

    public String getAppliedDate() {
        return appliedDate;
    }

    public void setAppliedDate(String appliedDate) {
        this.appliedDate = appliedDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}