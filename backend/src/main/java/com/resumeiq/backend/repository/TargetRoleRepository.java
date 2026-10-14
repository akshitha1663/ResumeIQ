package com.resumeiq.backend.repository;

import com.resumeiq.backend.model.TargetRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TargetRoleRepository extends JpaRepository<TargetRole, Long> {
    List<TargetRole> findByActiveTrueOrderByTitleAsc();
    Optional<TargetRole> findByTitleIgnoreCase(String title);
    boolean existsByTitleIgnoreCase(String title);
}
