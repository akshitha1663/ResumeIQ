package com.resumeiq.backend.repository;

import com.resumeiq.backend.model.JobAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobAlertRepository extends JpaRepository<JobAlert, Long> {
    List<JobAlert> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<JobAlert> findByActiveTrue();
}
