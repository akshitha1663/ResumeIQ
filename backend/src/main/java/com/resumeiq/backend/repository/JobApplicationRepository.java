package com.resumeiq.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.resumeiq.backend.model.JobApplication;

public interface JobApplicationRepository
        extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByUserId(Long userId);
}