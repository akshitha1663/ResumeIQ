package com.resumeiq.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeiq.backend.model.LearningRoadmap;
import com.resumeiq.backend.model.TargetRole;
import com.resumeiq.backend.model.User;
import com.resumeiq.backend.repository.LearningRoadmapRepository;
import com.resumeiq.backend.repository.TargetRoleRepository;
import com.resumeiq.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class RoadmapService {

    private final LearningRoadmapRepository roadmapRepository;
    private final TargetRoleRepository targetRoleRepository;
    private final UserRepository userRepository;
    private final SkillGapService skillGapService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public RoadmapService(LearningRoadmapRepository roadmapRepository,
                          TargetRoleRepository targetRoleRepository,
                          UserRepository userRepository,
                          SkillGapService skillGapService) {
        this.roadmapRepository = roadmapRepository;
        this.targetRoleRepository = targetRoleRepository;
        this.userRepository = userRepository;
        this.skillGapService = skillGapService;
    }

    public LearningRoadmap generateRoadmap(Long targetRoleId, int durationDays, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        TargetRole role = targetRoleRepository.findById(targetRoleId)
                .orElseThrow(() -> new RuntimeException("Target role not found: " + targetRoleId));

        int duration = (durationDays == 60) ? 60 : 30;

        // Perform skill gap analysis if resume exists, else fallback to full required skills
        List<String> focusSkills = new ArrayList<>();
        try {
            Map<String, Object> gap = skillGapService.analyzeGap(null, targetRoleId, null, userEmail);
            @SuppressWarnings("unchecked")
            List<String> missingSkills = (List<String>) gap.getOrDefault("missingSkills", List.of());
            @SuppressWarnings("unchecked")
            List<String> needsImprovement = (List<String>) gap.getOrDefault("needsImprovementSkills", List.of());
            focusSkills.addAll(missingSkills);
            focusSkills.addAll(needsImprovement);
        } catch (Exception ignored) {
            // User hasn't uploaded a resume yet; generate roadmap covering all key target role skills
        }

        if (focusSkills.isEmpty()) {
            focusSkills = MatchingService.parseSkills(role.getRequiredSkills());
        }

        // Generate structured weekly plan
        List<Map<String, Object>> weeks = buildWeeks(focusSkills, role.getTitle(), duration);

        try {
            String roadmapJson = objectMapper.writeValueAsString(weeks);

            // Check if existing roadmap for this role exists, else create new
            LearningRoadmap roadmap = roadmapRepository.findByUserIdAndTargetRoleId(user.getId(), targetRoleId)
                    .orElse(new LearningRoadmap(user.getId(), targetRoleId, role.getTitle(), duration, roadmapJson));

            roadmap.setDurationDays(duration);
            roadmap.setRoleTitle(role.getTitle());
            roadmap.setRoadmapJson(roadmapJson);
            roadmap.setUpdatedAt(LocalDateTime.now());

            return roadmapRepository.save(roadmap);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate roadmap: " + e.getMessage());
        }
    }

    public LearningRoadmap toggleTask(Long roadmapId, String taskId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        LearningRoadmap roadmap = roadmapRepository.findById(roadmapId)
                .orElseThrow(() -> new RuntimeException("Roadmap not found: " + roadmapId));

        if (!roadmap.getUserId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to this roadmap.");
        }

        Set<String> completed = new HashSet<>(
                Arrays.asList(roadmap.getCompletedTaskIds().split(","))
        );
        completed.remove(""); // clean empty strings

        if (completed.contains(taskId)) {
            completed.remove(taskId);
        } else {
            completed.add(taskId);
        }

        roadmap.setCompletedTaskIds(String.join(",", completed));

        // Calculate progress percentage
        int totalTasks = countTotalTasks(roadmap.getRoadmapJson());
        int progress = totalTasks > 0 ? (completed.size() * 100) / totalTasks : 0;
        roadmap.setProgressPercent(Math.min(100, progress));
        roadmap.setUpdatedAt(LocalDateTime.now());

        return roadmapRepository.save(roadmap);
    }

    public List<LearningRoadmap> getUserRoadmaps(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));
        return roadmapRepository.findByUserIdOrderByUpdatedAtDesc(user.getId());
    }

    private int countTotalTasks(String roadmapJson) {
        try {
            List<Map<String, Object>> weeks = objectMapper.readValue(
                    roadmapJson, new TypeReference<List<Map<String, Object>>>() {});
            int count = 0;
            for (Map<String, Object> week : weeks) {
                @SuppressWarnings("unchecked")
                List<Object> tasks = (List<Object>) week.get("tasks");
                if (tasks != null) count += tasks.size();
            }
            return count;
        } catch (Exception e) {
            return 1;
        }
    }

    private List<Map<String, Object>> buildWeeks(List<String> focusSkills, String roleTitle, int durationDays) {
        int totalWeeks = durationDays == 60 ? 8 : 4;
        List<Map<String, Object>> weeks = new ArrayList<>();

        for (int w = 1; w <= totalWeeks; w++) {
            Map<String, Object> week = new LinkedHashMap<>();
            week.put("weekNumber", w);

            String skillForWeek = focusSkills.size() >= w
                    ? focusSkills.get(w - 1)
                    : focusSkills.get((w - 1) % Math.max(1, focusSkills.size()));

            week.put("theme", "Week " + w + ": " + skillForWeek + " Fundamentals & Application");
            week.put("goal", "Gain practical competence in " + skillForWeek + " and apply it to a real-world project.");

            List<Map<String, String>> tasks = new ArrayList<>();
            tasks.add(Map.of(
                "id", "w" + w + "_t1",
                "title", "Core Concepts: Read official docs and guides for " + skillForWeek,
                "type", "Study",
                "estimatedHours", "3 hrs"
            ));
            tasks.add(Map.of(
                "id", "w" + w + "_t2",
                "title", "Hands-On Practice: Build 3 focused exercises demonstrating " + skillForWeek,
                "type", "Coding",
                "estimatedHours", "4 hrs"
            ));
            tasks.add(Map.of(
                "id", "w" + w + "_t3",
                "title", "Portfolio Mini-Project: Integrate " + skillForWeek + " into a standalone demo repository",
                "type", "Project",
                "estimatedHours", "5 hrs"
            ));
            tasks.add(Map.of(
                "id", "w" + w + "_t4",
                "title", "Knowledge Check: Review standard interview questions for " + skillForWeek,
                "type", "Interview Prep",
                "estimatedHours", "2 hrs"
            ));

            week.put("tasks", tasks);
            week.put("miniProject", "Milestone " + w + ": " + skillForWeek + " Showcase Repository with README & tests.");
            week.put("freeResource", "https://devdocs.io/");

            weeks.add(week);
        }

        return weeks;
    }
}
