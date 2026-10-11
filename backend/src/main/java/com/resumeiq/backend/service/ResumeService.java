package com.resumeiq.backend.service;

import com.resumeiq.backend.model.Resume;
import com.resumeiq.backend.repository.ResumeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResumeService {

    private final ResumeRepository resumeRepository;

    public ResumeService(ResumeRepository resumeRepository) {
        this.resumeRepository = resumeRepository;
    }

    public List<Resume> getAllResumes() {
        return resumeRepository.findAll();
    }

    public Resume getResumeById(Long id) {
        return resumeRepository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Resume not found with ID: " + id));
    }
}