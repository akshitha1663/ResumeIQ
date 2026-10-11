package com.resumeiq.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.resumeiq.backend.model.Job;

public interface JobRepository extends JpaRepository<Job, Long> {

}