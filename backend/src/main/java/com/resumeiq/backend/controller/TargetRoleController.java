package com.resumeiq.backend.controller;

import com.resumeiq.backend.model.TargetRole;
import com.resumeiq.backend.repository.JobRepository;
import com.resumeiq.backend.repository.TargetRoleRepository;
import com.resumeiq.backend.service.SkillGapService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/target-roles")
public class TargetRoleController {

    private final TargetRoleRepository targetRoleRepository;
    private final SkillGapService skillGapService;
    private final JobRepository jobRepository;

    public TargetRoleController(TargetRoleRepository targetRoleRepository,
                                SkillGapService skillGapService,
                                JobRepository jobRepository) {
        this.targetRoleRepository = targetRoleRepository;
        this.skillGapService = skillGapService;
        this.jobRepository = jobRepository;
    }

    @GetMapping
    public ResponseEntity<List<TargetRole>> getActiveRoles() {
        return ResponseEntity.ok(targetRoleRepository.findByActiveTrueOrderByTitleAsc());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TargetRole> getRoleById(@PathVariable Long id) {
        return targetRoleRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/compare")
    public ResponseEntity<List<Map<String, Object>>> compareRoles(
            @RequestParam List<Long> ids,
            Principal principal) {
        String email = principal != null ? principal.getName() : null;

        List<Map<String, Object>> comparisons = new ArrayList<>();
        for (Long id : ids) {
            Optional<TargetRole> roleOpt = targetRoleRepository.findById(id);
            if (roleOpt.isEmpty()) continue;

            TargetRole role = roleOpt.get();
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", role.getId());
            map.put("title", role.getTitle());
            map.put("category", role.getCategory());
            map.put("experienceLevel", role.getExperienceLevel());
            map.put("description", role.getDescription());
            map.put("requiredSkills", role.getRequiredSkills());
            map.put("optionalSkills", role.getOptionalSkills());

            // Count matching active jobs in the platform
            long jobCount = jobRepository.findByActiveTrueOrderByIdDesc().stream()
                    .filter(j -> j.getTitle().toLowerCase().contains(role.getTitle().toLowerCase())
                            || (j.getSkills() != null && j.getSkills().toLowerCase().contains(role.getTitle().toLowerCase())))
                    .count();
            map.put("availableJobsCount", jobCount);

            // Compute user resume match if logged in
            if (email != null) {
                try {
                    Map<String, Object> gap = skillGapService.analyzeGap(null, role.getId(), null, email);
                    map.put("matchPercent", gap.get("matchPercent"));
                    map.put("matchedSkills", gap.get("matchedSkills"));
                    map.put("missingSkills", gap.get("missingSkills"));
                    map.put("needsImprovementSkills", gap.get("needsImprovementSkills"));
                } catch (Exception e) {
                    map.put("matchPercent", 0);
                    map.put("matchedSkills", List.of());
                    map.put("missingSkills", List.of());
                }
            } else {
                map.put("matchPercent", null);
            }

            comparisons.add(map);
        }

        return ResponseEntity.ok(comparisons);
    }
}
