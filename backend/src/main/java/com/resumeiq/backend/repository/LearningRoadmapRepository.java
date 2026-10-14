package com.resumeiq.backend.repository;

import com.resumeiq.backend.model.LearningRoadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LearningRoadmapRepository extends JpaRepository<LearningRoadmap, Long> {
    List<LearningRoadmap> findByUserIdOrderByUpdatedAtDesc(Long userId);
    Optional<LearningRoadmap> findFirstByUserIdOrderByUpdatedAtDesc(Long userId);
    Optional<LearningRoadmap> findByUserIdAndTargetRoleId(Long userId, Long targetRoleId);
}
