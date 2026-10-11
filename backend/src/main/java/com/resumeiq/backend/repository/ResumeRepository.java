package com.resumeiq.backend.repository;

import com.resumeiq.backend.model.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResumeRepository
        extends JpaRepository<Resume, Long> {
}